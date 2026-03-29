const { db } = require('../../config/db');

function logAudit({ actorId, action, metadata = {} } = {}) {
  setImmediate(() => {
    db('audit_logs').insert({ actor_id: actorId, action, metadata: JSON.stringify(metadata) })
      .catch((e) => console.warn('[AUDIT]', e.message));
  });
}

/* ── fullyApproveExpense ─────────────────────────────────── */
async function fullyApproveExpense(expenseId, trx = db) {
  await trx('expenses').where({ id: expenseId }).update({ status: 'approved' });
  await trx('expense_approvals')
    .where({ expense_id: expenseId, status: 'pending' })
    .update({ status: 'skipped', decided_at: db.fn.now() });
}

/* ── activateManagerRuleSteps ────────────────────────────── */
// Called after manager step (step 0) is approved
async function activateRuleSteps(expense, rule, trx = db) {
  const ruleSteps = await trx('approval_rule_steps')
    .where({ rule_id: rule.id })
    .orderBy('step_order', 'asc');

  if (ruleSteps.length === 0) {
    // Manager was the only approver needed
    await fullyApproveExpense(expense.id, trx);
    return { done: true };
  }

  if (rule.approval_type === 'sequential') {
    // Insert only the first step
    await trx('expense_approvals').insert({
      expense_id:  expense.id,
      approver_id: ruleSteps[0].approver_id,
      step_order:  ruleSteps[0].step_order,
      status:      'pending',
    });
    await trx('expenses').where({ id: expense.id }).update({ current_approval_step: ruleSteps[0].step_order });
  } else {
    // percentage / specific / hybrid: insert ALL steps simultaneously
    await trx('expense_approvals').insert(
      ruleSteps.map((s) => ({
        expense_id:  expense.id,
        approver_id: s.approver_id,
        step_order:  s.step_order,
        status:      'pending',
      }))
    );
    await trx('expenses').where({ id: expense.id }).update({ current_approval_step: ruleSteps[0].step_order });
  }
  return { done: false };
}

/* ── getPendingApprovals ─────────────────────────────────── */
async function getPendingApprovals(approverId, companyId, filters = {}) {
  const page   = Math.max(1, parseInt(filters.page  || 1,  10));
  const limit  = Math.min(50, Math.max(1, parseInt(filters.limit || 10, 10)));
  const offset = (page - 1) * limit;

  const buildBase = () => {
    let q = db('expense_approvals as ea')
      .join('expenses as e', 'e.id', 'ea.expense_id')
      .join('users as u', 'u.id', 'e.employee_id')
      .join('companies as c', 'c.id', 'e.company_id')
      .where('ea.approver_id', approverId)
      .where('ea.status', 'pending')
      .where('e.company_id', companyId)
      .whereIn('e.status', ['pending', 'in_review']);

    if (filters.category)  q = q.where('e.category', filters.category);
    if (filters.minAmount) q = q.where('e.amount_in_company_currency', '>=', filters.minAmount);
    if (filters.maxAmount) q = q.where('e.amount_in_company_currency', '<=', filters.maxAmount);
    return q;
  };

  const rows = await buildBase()
    .select(
      'e.id', 'e.amount_in_company_currency', 'e.currency_code',
      'e.category', 'e.description', 'e.expense_date',
      'e.risk_score', 'e.risk_flags', 'e.is_flagged_for_review',
      'e.created_at', 'e.employee_note', 'e.status',
      'u.name as employee_name', 'u.email as employee_email',
      'ea.step_order as current_step',
      'c.currency_symbol',
    )
    .orderByRaw('e.is_flagged_for_review DESC, e.risk_score DESC, e.created_at ASC')
    .limit(limit).offset(offset);

  const [{ count }] = await buildBase().count('ea.id as count');

  return {
    expenses: rows.map((r) => ({
      id:                     r.id,
      amountInCompanyCurrency: parseFloat(r.amount_in_company_currency),
      currencySymbol:         r.currency_symbol,
      category:               r.category,
      description:            r.description,
      expenseDate:            r.expense_date,
      status:                 r.status,
      riskScore:              r.risk_score,
      riskFlags:              r.risk_flags,
      isFlaggedForReview:     r.is_flagged_for_review,
      employeeName:           r.employee_name,
      employeeEmail:          r.employee_email,
      employeeNote:           r.employee_note,
      currentStep:            r.current_step,
      createdAt:              r.created_at,
    })),
    pagination: {
      total:      parseInt(count),
      page, limit,
      totalPages: Math.ceil(parseInt(count) / limit),
    },
  };
}

/* ── approveExpense ──────────────────────────────────────── */
async function approveExpense(expenseId, approverId, companyId, comment) {
  // 1. Fetch expense
  const expense = await db('expenses')
    .where({ id: expenseId, company_id: companyId })
    .select('id', 'status', 'approval_rule_id', 'current_approval_step', 'employee_id')
    .first();

  if (!expense) { const e = new Error('Expense not found.'); e.statusCode = 404; throw e; }
  if (!['pending', 'in_review'].includes(expense.status)) {
    const e = new Error('This expense is not currently awaiting approval.'); e.statusCode = 400; throw e;
  }

  // 2. Fetch CURRENT pending approval for this approver
  const currentApproval = await db('expense_approvals')
    .where({ expense_id: expenseId, approver_id: approverId, status: 'pending' })
    .first();

  if (!currentApproval) {
    const e = new Error('You are not assigned to approve this expense, or it has already been decided.');
    e.statusCode = 403; throw e;
  }

  return db.transaction(async (trx) => {
    // 3. Mark this step approved
    await trx('expense_approvals').where({ id: currentApproval.id }).update({
      status:     'approved',
      comment:    comment || null,
      decided_at: trx.fn.now(),
    });

    // 4. No rule → this is a direct admin approval → fully approve
    if (!expense.approval_rule_id) {
      await fullyApproveExpense(expenseId, trx);
      logAudit({ actorId: approverId, action: 'EXPENSE_FULLY_APPROVED',
        metadata: { entityId: expenseId, step: currentApproval.step_order } });
      return { fullyApproved: true, message: 'Expense fully approved.' };
    }

    // 5. Fetch rule
    const rule = await trx('approval_rules').where({ id: expense.approval_rule_id }).first();

    const isManagerStep = currentApproval.step_order === 0;

    // 6a. Manager step approved → activate rule steps
    if (isManagerStep) {
      const { done } = await activateRuleSteps(expense, rule, trx);
      const action = done ? 'EXPENSE_FULLY_APPROVED' : 'EXPENSE_APPROVED_STEP';
      logAudit({ actorId: approverId, action,
        metadata: { entityId: expenseId, step: 0, comment } });
      return { fullyApproved: done, message: done ? 'Expense fully approved.' : 'Manager approved. Forwarded to next approvers.' };
    }

    // 6b. Regular step — handle by approval_type
    switch (rule.approval_type) {
      case 'sequential': {
        const nextStep = await trx('approval_rule_steps')
          .where({ rule_id: rule.id })
          .where('step_order', '>', currentApproval.step_order)
          .orderBy('step_order', 'asc').first();

        if (nextStep) {
          // Check not already inserted (edge case for hybrid transitions)
          const exists = await trx('expense_approvals')
            .where({ expense_id: expenseId, approver_id: nextStep.approver_id, step_order: nextStep.step_order })
            .first();
          if (!exists) {
            await trx('expense_approvals').insert({
              expense_id: expenseId, approver_id: nextStep.approver_id,
              step_order: nextStep.step_order, status: 'pending',
            });
          }
          await trx('expenses').where({ id: expenseId }).update({ current_approval_step: nextStep.step_order });
          logAudit({ actorId: approverId, action: 'EXPENSE_APPROVED_STEP',
            metadata: { entityId: expenseId, step: currentApproval.step_order } });
          return { fullyApproved: false, message: 'Forwarded to next approver.' };
        }

        // Last step done → fully approve
        await fullyApproveExpense(expenseId, trx);
        logAudit({ actorId: approverId, action: 'EXPENSE_FULLY_APPROVED',
          metadata: { entityId: expenseId, step: currentApproval.step_order } });
        return { fullyApproved: true, message: 'Expense fully approved.' };
      }

      case 'percentage': {
        const [{ count: approvedCount }] = await trx('expense_approvals')
          .where({ expense_id: expenseId, status: 'approved' }).count('id as count');
        const [{ count: totalSteps }] = await trx('approval_rule_steps')
          .where({ rule_id: rule.id }).count('id as count');
        const managerBonus = rule.is_manager_first ? 1 : 0;
        const total        = parseInt(totalSteps) + managerBonus;
        const pct          = (parseInt(approvedCount) / total) * 100;

        if (pct >= rule.percentage_threshold) {
          await fullyApproveExpense(expenseId, trx);
          logAudit({ actorId: approverId, action: 'EXPENSE_FULLY_APPROVED', metadata: { entityId: expenseId, pct } });
          return { fullyApproved: true, message: 'Approval threshold reached. Expense approved.' };
        }
        logAudit({ actorId: approverId, action: 'EXPENSE_APPROVED_STEP', metadata: { entityId: expenseId, pct } });
        return { fullyApproved: false, message: `Approval recorded (${pct.toFixed(0)}% of ${rule.percentage_threshold}% threshold).` };
      }

      case 'specific': {
        if (approverId === rule.specific_approver_id) {
          await fullyApproveExpense(expenseId, trx);
          logAudit({ actorId: approverId, action: 'EXPENSE_FULLY_APPROVED', metadata: { entityId: expenseId, by: 'specific_approver' } });
          return { fullyApproved: true, message: 'Approved by designated approver. Expense fully approved.' };
        }
        logAudit({ actorId: approverId, action: 'EXPENSE_APPROVED_STEP', metadata: { entityId: expenseId } });
        return { fullyApproved: false, message: 'Approval recorded. Awaiting specific approver.' };
      }

      case 'hybrid': {
        // Condition 1: specific approver
        if (approverId === rule.specific_approver_id) {
          await fullyApproveExpense(expenseId, trx);
          logAudit({ actorId: approverId, action: 'EXPENSE_FULLY_APPROVED', metadata: { entityId: expenseId, trigger: 'specific' } });
          return { fullyApproved: true, message: 'Approved by designated approver.' };
        }
        // Condition 2: percentage threshold
        const [{ count: approvedCount }] = await trx('expense_approvals')
          .where({ expense_id: expenseId, status: 'approved' }).count('id as count');
        const [{ count: totalSteps }]    = await trx('approval_rule_steps')
          .where({ rule_id: rule.id }).count('id as count');
        const total = parseInt(totalSteps) + (rule.is_manager_first ? 1 : 0);
        const pct   = (parseInt(approvedCount) / total) * 100;

        if (pct >= rule.percentage_threshold) {
          await fullyApproveExpense(expenseId, trx);
          logAudit({ actorId: approverId, action: 'EXPENSE_FULLY_APPROVED', metadata: { entityId: expenseId, trigger: 'percentage', pct } });
          return { fullyApproved: true, message: 'Approval threshold reached. Expense approved.' };
        }
        logAudit({ actorId: approverId, action: 'EXPENSE_APPROVED_STEP', metadata: { entityId: expenseId } });
        return { fullyApproved: false, message: 'Approval recorded. Waiting for conditions to be met.' };
      }

      default: {
        await fullyApproveExpense(expenseId, trx);
        return { fullyApproved: true, message: 'Expense approved.' };
      }
    }
  });
}

/* ── rejectExpense ───────────────────────────────────────── */
async function rejectExpense(expenseId, approverId, companyId, comment) {
  const expense = await db('expenses')
    .where({ id: expenseId, company_id: companyId })
    .select('id', 'status').first();

  if (!expense) { const e = new Error('Expense not found.'); e.statusCode = 404; throw e; }
  if (!['pending', 'in_review'].includes(expense.status)) {
    const e = new Error('This expense is not currently awaiting approval.'); e.statusCode = 400; throw e;
  }

  const currentApproval = await db('expense_approvals')
    .where({ expense_id: expenseId, approver_id: approverId, status: 'pending' }).first();
  if (!currentApproval) {
    const e = new Error('You are not assigned to approve this expense.'); e.statusCode = 403; throw e;
  }

  await db.transaction(async (trx) => {
    await trx('expense_approvals').where({ id: currentApproval.id }).update({
      status: 'rejected', comment, decided_at: trx.fn.now(),
    });
    await trx('expenses').where({ id: expenseId }).update({
      status: 'rejected', rejection_reason: comment,
    });
    // Cancel all remaining pending approval steps
    await trx('expense_approvals')
      .where({ expense_id: expenseId, status: 'pending' })
      .update({ status: 'skipped', decided_at: trx.fn.now() });
  });

  logAudit({ actorId: approverId, action: 'EXPENSE_REJECTED',
    metadata: { entityId: expenseId, step: currentApproval.step_order, comment } });

  return { message: 'Expense rejected.' };
}

/* ── getTimeline ─────────────────────────────────────────── */
async function getTimeline(expenseId, companyId, requestingUser) {
  const expense = await db('expenses')
    .where({ id: expenseId, company_id: companyId })
    .select('id', 'employee_id', 'status').first();

  if (!expense) { const e = new Error('Expense not found.'); e.statusCode = 404; throw e; }

  if (requestingUser.role === 'employee' && expense.employee_id !== requestingUser.userId) {
    const e = new Error('You can only view timelines for your own expenses.'); e.statusCode = 403; throw e;
  }

  const timeline = await db('expense_approvals as ea')
    .join('users as u', 'u.id', 'ea.approver_id')
    .where('ea.expense_id', expenseId)
    .select('ea.step_order', 'ea.status', 'ea.comment', 'ea.decided_at',
      'u.name as approver_name', 'u.role as approver_role')
    .orderBy('ea.step_order', 'asc');

  return { expenseId, expenseStatus: expense.status, timeline };
}

module.exports = { getPendingApprovals, approveExpense, rejectExpense, getTimeline };
