const { db }                  = require('../../config/db');
const { convertCurrency }     = require('../../utils/currency');
const { extractReceiptData }  = require('../../utils/ocr');
const { calculateFraudRisk }  = require('../../utils/fraud');
const { hashFile }            = require('../../utils/fileUpload');

/* ── Audit helper ─────────────────────────────────────────── */
function logAudit({ actorId, action, metadata = {}, ipAddress } = {}) {
  setImmediate(() => {
    db('audit_logs').insert({
      actor_id:   actorId,
      action,
      ip_address: ipAddress || null,
      metadata:   JSON.stringify(metadata),
    }).catch((e) => console.warn('[AUDIT]', e.message));
  });
}

/* ── findMatchingRule ─────────────────────────────────────── */
async function findMatchingRule(companyId, category, amountInCompanyCurrency) {
  const rules = await db('approval_rules')
    .where({ company_id: companyId, is_active: true })
    .select('*')
    .orderByRaw(`
      CASE WHEN category IS NOT NULL THEN 0 ELSE 1 END ASC,
      COALESCE(min_amount, 0) DESC
    `);

  for (const rule of rules) {
    if (rule.category && rule.category !== category) continue;
    if (rule.min_amount !== null && amountInCompanyCurrency < parseFloat(rule.min_amount)) continue;
    if (rule.max_amount !== null && amountInCompanyCurrency > parseFloat(rule.max_amount)) continue;
    return rule;
  }
  return null;
}

/* ── initializeApprovalWorkflow ───────────────────────────── */
async function initializeApprovalWorkflow(expenseId, rule, employeeId) {
  if (!rule) {
    // No rule → assign to first admin in company as fallback
    const expense = await db('expenses').where({ id: expenseId }).select('company_id').first();
    const admin   = await db('users')
      .where({ company_id: expense.company_id, role: 'admin', is_active: true })
      .orderBy('created_at', 'asc')
      .select('id').first();
    if (admin) {
      await db('expense_approvals').insert({
        expense_id: expenseId, approver_id: admin.id,
        step_order: 1, status: 'pending',
      });
      await db('expenses').where({ id: expenseId }).update({ current_approval_step: 1 });
    }
    return;
  }

  const employee  = await db('users').where({ id: employeeId }).select('manager_id').first();
  const ruleSteps = await db('approval_rule_steps')
    .where({ rule_id: rule.id })
    .orderBy('step_order', 'asc');

  const toInsert        = [];
  let   firstActiveStep = 1;

  // Step 0: manager step
  if (rule.is_manager_first && employee?.manager_id) {
    toInsert.push({ expense_id: expenseId, approver_id: employee.manager_id, step_order: 0, status: 'pending' });
    firstActiveStep = 0;
  }

  if (firstActiveStep === 0) {
    // Don't insert rule steps yet — activate after manager approves
  } else if (rule.approval_type === 'sequential') {
    // Only insert first step
    if (ruleSteps.length > 0) {
      toInsert.push({ expense_id: expenseId, approver_id: ruleSteps[0].approver_id, step_order: ruleSteps[0].step_order, status: 'pending' });
      firstActiveStep = ruleSteps[0].step_order;
    }
  } else {
    // Percentage / Specific / Hybrid: insert ALL steps simultaneously
    for (const s of ruleSteps) {
      toInsert.push({ expense_id: expenseId, approver_id: s.approver_id, step_order: s.step_order, status: 'pending' });
    }
    if (ruleSteps.length > 0) firstActiveStep = ruleSteps[0].step_order;
  }

  if (toInsert.length > 0) await db('expense_approvals').insert(toInsert);
  await db('expenses').where({ id: expenseId }).update({ current_approval_step: firstActiveStep });
}

/* ── extractOCR ───────────────────────────────────────────── */
async function extractOCR(filePath) {
  return extractReceiptData(filePath);
}

/* ── submitExpense ────────────────────────────────────────── */
async function submitExpense(data, employeeId, companyId, file) {
  const { amount, currency_code, category, description, expense_date, employee_note } = data;

  // 1. Fetch company currency
  const company = await db('companies').where({ id: companyId }).select('currency_code').first();
  const companyCurrency = company?.currency_code || currency_code;

  // 2. Currency conversion (never blocks on failure)
  const conversion = await convertCurrency(parseFloat(amount), currency_code, companyCurrency);
  const amountInCompanyCurrency = conversion?.convertedAmount ?? parseFloat(amount);
  const exchangeRate            = conversion?.rate            ?? 1;

  // 3. Receipt handling
  let receiptUrl = null, receiptHash = null, receiptOriginalName = null;
  if (file) {
    receiptUrl          = `/uploads/receipts/${file.filename}`;
    receiptHash         = hashFile(file.path);
    receiptOriginalName = file.originalname;
  }

  // 4. OCR (non-blocking)
  let ocrData = {};
  if (file) {
    try { ocrData = await extractReceiptData(file.path); } catch { /* ignore */ }
  }

  // 5. Fraud detection (non-blocking)
  const fraudResult = await calculateFraudRisk({
    expense: { amount, category, expense_date, amount_in_company_currency: amountInCompanyCurrency },
    employeeId, companyId,
    receiptHash,
    ocrData,
  });

  // 6. Find matching approval rule
  const rule = await findMatchingRule(companyId, category, amountInCompanyCurrency);

  // 7. Determine status
  const status = fraudResult.isFlaggedForReview ? 'in_review' : 'pending';

  // 8. Insert expense
  const [expense] = await db('expenses').insert({
    company_id:                companyId,
    employee_id:               employeeId,
    amount:                    parseFloat(amount),
    currency_code:             currency_code.toUpperCase(),
    amount_in_company_currency: amountInCompanyCurrency,
    exchange_rate:             exchangeRate,
    category,
    description,
    expense_date,
    receipt_url:               receiptUrl,
    receipt_hash:              receiptHash,
    receipt_original_name:     receiptOriginalName,
    ocr_data:                  JSON.stringify(ocrData),
    risk_score:                fraudResult.riskScore,
    risk_flags:                JSON.stringify(fraudResult.flags),
    is_flagged_for_review:     fraudResult.isFlaggedForReview,
    status,
    approval_rule_id:          rule?.id || null,
    employee_note:             employee_note || null,
  }).returning('*');

  // 9. Initialize approval workflow (only for non-flagged expenses)
  if (status === 'pending') {
    try { await initializeApprovalWorkflow(expense.id, rule, employeeId); } catch (e) {
      console.error('[APPROVAL INIT ERROR]', e.message);
    }
  }

  // 10. Audit log
  logAudit({
    actorId:   employeeId,
    action:    'EXPENSE_SUBMITTED',
    metadata:  { entityType: 'expense', entityId: expense.id, amount, category, riskScore: fraudResult.riskScore },
  });

  return {
    id:                     expense.id,
    amount:                 parseFloat(expense.amount),
    currencyCode:           expense.currency_code,
    amountInCompanyCurrency: parseFloat(expense.amount_in_company_currency),
    category:               expense.category,
    description:            expense.description,
    expenseDate:            expense.expense_date,
    status:                 expense.status,
    riskScore:              expense.risk_score,
    riskFlags:              fraudResult.flags,
    isFlaggedForReview:     expense.is_flagged_for_review,
    receiptUrl:             expense.receipt_url,
    employeeNote:           expense.employee_note,
    createdAt:              expense.created_at,
  };
}

/* ── getMyExpenses ────────────────────────────────────────── */
async function getMyExpenses(employeeId, companyId, filters = {}) {
  const page   = Math.max(1, parseInt(filters.page  || 1,  10));
  const limit  = Math.min(50, Math.max(1, parseInt(filters.limit || 10, 10)));
  const offset = (page - 1) * limit;

  const buildBase = () => {
    let q = db('expenses as e')
      .where('e.employee_id', employeeId)
      .where('e.company_id', companyId);
    if (filters.status)    q = q.where('e.status', filters.status);
    if (filters.category)  q = q.where('e.category', filters.category);
    if (filters.startDate) q = q.where('e.expense_date', '>=', filters.startDate);
    if (filters.endDate)   q = q.where('e.expense_date', '<=', filters.endDate);
    return q;
  };

  const expenses = await buildBase()
    .leftJoin('expense_approvals as ea', function () {
      this.on('ea.expense_id', '=', 'e.id')
          .andOn('ea.step_order', '=', db.raw('e.current_approval_step'))
          .andOnVal('ea.status', 'pending');
    })
    .leftJoin('users as u', 'u.id', 'ea.approver_id')
    .select(
      'e.id', 'e.amount', 'e.currency_code', 'e.amount_in_company_currency',
      'e.category', 'e.description', 'e.expense_date', 'e.status',
      'e.risk_score', 'e.is_flagged_for_review', 'e.receipt_url',
      'e.employee_note', 'e.rejection_reason', 'e.created_at',
      'u.name as current_approver_name',
    )
    .orderBy('e.created_at', 'desc')
    .limit(limit).offset(offset);

  const [{ count }] = await buildBase().count('e.id as count');

  return {
    expenses: expenses.map((e) => ({
      id:                     e.id,
      amount:                 parseFloat(e.amount),
      currencyCode:           e.currency_code,
      amountInCompanyCurrency: parseFloat(e.amount_in_company_currency),
      category:               e.category,
      description:            e.description,
      expenseDate:            e.expense_date,
      status:                 e.status,
      riskScore:              e.risk_score,
      isFlaggedForReview:     e.is_flagged_for_review,
      receiptUrl:             e.receipt_url,
      employeeNote:           e.employee_note,
      rejectionReason:        e.rejection_reason,
      currentApproverName:    e.current_approver_name,
      createdAt:              e.created_at,
    })),
    pagination: {
      total:      parseInt(count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(count) / limit),
    },
  };
}

/* ── getExpenseById ──────────────────────────────────────── */
async function getExpenseById(expenseId, companyId, requestingUser) {
  const expense = await db('expenses as e')
    .join('users as u', 'u.id', 'e.employee_id')
    .where('e.id', expenseId)
    .where('e.company_id', companyId)
    .select(
      'e.*',
      'u.name as employee_name', 'u.email as employee_email',
    )
    .first();

  if (!expense) { const e = new Error('Expense not found.'); e.statusCode = 404; throw e; }

  // Access control
  if (requestingUser.role === 'employee' && expense.employee_id !== requestingUser.userId) {
    const e = new Error('You can only view your own expenses.'); e.statusCode = 403; throw e;
  }

  // Fetch approval timeline
  const timeline = await db('expense_approvals as ea')
    .join('users as u', 'u.id', 'ea.approver_id')
    .where('ea.expense_id', expenseId)
    .select('ea.step_order', 'ea.status', 'ea.comment', 'ea.decided_at',
      'u.name as approver_name', 'u.role as approver_role')
    .orderBy('ea.step_order', 'asc');

  return {
    id:                     expense.id,
    amount:                 parseFloat(expense.amount),
    currencyCode:           expense.currency_code,
    amountInCompanyCurrency: parseFloat(expense.amount_in_company_currency),
    exchangeRate:           parseFloat(expense.exchange_rate),
    category:               expense.category,
    description:            expense.description,
    expenseDate:            expense.expense_date,
    status:                 expense.status,
    riskScore:              expense.risk_score,
    riskFlags:              expense.risk_flags,
    isFlaggedForReview:     expense.is_flagged_for_review,
    ocrData:                expense.ocr_data,
    receiptUrl:             expense.receipt_url,
    receiptOriginalName:    expense.receipt_original_name,
    employeeNote:           expense.employee_note,
    rejectionReason:        expense.rejection_reason,
    employeeName:           expense.employee_name,
    employeeEmail:          expense.employee_email,
    approvalTimeline:       timeline,
    createdAt:              expense.created_at,
    updatedAt:              expense.updated_at,
  };
}

/* ── cancelExpense ───────────────────────────────────────── */
async function cancelExpense(expenseId, employeeId, companyId) {
  const expense = await db('expenses')
    .where({ id: expenseId, employee_id: employeeId, company_id: companyId })
    .select('id', 'status').first();

  if (!expense) { const e = new Error('Expense not found.'); e.statusCode = 404; throw e; }
  if (!['draft', 'pending'].includes(expense.status)) {
    const e = new Error('Cannot cancel an expense that is already being reviewed or processed.');
    e.statusCode = 400; throw e;
  }

  await db('expenses').where({ id: expenseId }).update({ status: 'cancelled' });

  logAudit({ actorId: employeeId, action: 'EXPENSE_CANCELLED', metadata: { entityId: expenseId } });

  return { message: 'Expense cancelled successfully.' };
}

module.exports = {
  extractOCR,
  submitExpense,
  getMyExpenses,
  getExpenseById,
  cancelExpense,
  initializeApprovalWorkflow,
  findMatchingRule,
};
