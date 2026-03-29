const { db } = require('../../config/db');

/* ── getAdminDashboard ───────────────────────────────────── */
async function getAdminDashboard(companyId) {
  const [summary] = await db('expenses')
    .where({ company_id: companyId })
    .select(
      db.raw(`COUNT(*) FILTER (WHERE status = 'pending')   AS "pendingCount"`),
      db.raw(`COUNT(*) FILTER (WHERE status = 'approved')  AS "approvedCount"`),
      db.raw(`COUNT(*) FILTER (WHERE status = 'rejected')  AS "rejectedCount"`),
      db.raw(`COUNT(*) FILTER (WHERE status = 'in_review') AS "flaggedCount"`),
      db.raw(`SUM(amount_in_company_currency) FILTER (WHERE status = 'approved') AS "totalApprovedAmount"`),
      db.raw(`SUM(amount_in_company_currency) FILTER (WHERE status = 'pending')  AS "totalPendingAmount"`),
    );

  const expensesByCategory = await db('expenses')
    .where({ company_id: companyId, status: 'approved' })
    .select('category', db.raw('COUNT(*) as count'), db.raw('SUM(amount_in_company_currency) as "totalAmount"'))
    .groupBy('category')
    .orderBy('totalAmount', 'desc');

  const monthlyTrend = await db('expenses')
    .where({ company_id: companyId })
    .where('expense_date', '>=', db.raw(`NOW() - INTERVAL '6 months'`))
    .select(
      db.raw(`TO_CHAR(expense_date, 'YYYY-MM') as month`),
      db.raw('COUNT(*) as count'),
      db.raw('SUM(amount_in_company_currency) as "totalAmount"'),
    )
    .groupByRaw(`TO_CHAR(expense_date, 'YYYY-MM')`)
    .orderBy('month', 'asc');

  const flaggedExpenses = await db('expenses as e')
    .join('users as u', 'u.id', 'e.employee_id')
    .where({ 'e.company_id': companyId, 'e.status': 'in_review' })
    .select(
      'e.id', 'e.amount_in_company_currency', 'e.category',
      'e.risk_score', 'e.risk_flags', 'e.created_at',
      'u.name as employee_name',
    )
    .orderBy('e.risk_score', 'desc')
    .limit(5);

  const usersByRole = await db('users')
    .where({ company_id: companyId })
    .select(
      'role',
      db.raw('COUNT(*) as count'),
      db.raw(`COUNT(*) FILTER (WHERE is_active = true) AS "activeCount"`),
    )
    .groupBy('role');

  return {
    summary: {
      pendingCount:        parseInt(summary.pendingCount  || 0),
      approvedCount:       parseInt(summary.approvedCount || 0),
      rejectedCount:       parseInt(summary.rejectedCount || 0),
      flaggedCount:        parseInt(summary.flaggedCount  || 0),
      totalApprovedAmount: parseFloat(summary.totalApprovedAmount || 0),
      totalPendingAmount:  parseFloat(summary.totalPendingAmount  || 0),
    },
    expensesByCategory: expensesByCategory.map((r) => ({
      category: r.category, count: parseInt(r.count), totalAmount: parseFloat(r.totalAmount),
    })),
    monthlyTrend: monthlyTrend.map((r) => ({
      month: r.month, count: parseInt(r.count), totalAmount: parseFloat(r.totalAmount),
    })),
    flaggedExpenses: flaggedExpenses.map((r) => ({
      id: r.id, amountInCompanyCurrency: parseFloat(r.amount_in_company_currency),
      category: r.category, riskScore: r.risk_score, riskFlags: r.risk_flags,
      createdAt: r.created_at, employeeName: r.employee_name,
    })),
    usersByRole: usersByRole.map((r) => ({
      role: r.role, count: parseInt(r.count), activeCount: parseInt(r.activeCount),
    })),
  };
}

/* ── getManagerDashboard ─────────────────────────────────── */
async function getManagerDashboard(managerId, companyId) {
  const [{ count: pendingCount }] = await db('expense_approvals as ea')
    .join('expenses as e', 'e.id', 'ea.expense_id')
    .where({ 'ea.approver_id': managerId, 'ea.status': 'pending', 'e.company_id': companyId })
    .whereIn('e.status', ['pending', 'in_review'])
    .count('ea.id as count');

  const recentDecisions = await db('expense_approvals as ea')
    .join('expenses as e', 'e.id', 'ea.expense_id')
    .join('users as u', 'u.id', 'e.employee_id')
    .where({ 'ea.approver_id': managerId, 'e.company_id': companyId })
    .whereIn('ea.status', ['approved', 'rejected'])
    .select(
      'e.id', 'e.category', 'e.amount_in_company_currency',
      'ea.status as decision', 'ea.decided_at', 'ea.comment',
      'u.name as employee_name',
    )
    .orderBy('ea.decided_at', 'desc')
    .limit(10);

  const teamMembers = await db('users')
    .where({ manager_id: managerId, company_id: companyId })
    .select(
      'id', 'name', 'email', 'is_active',
      db.raw(`(SELECT COUNT(*) FROM expenses WHERE employee_id = users.id AND status = 'pending') AS "pendingExpenses"`),
    );

  return {
    pendingCount:    parseInt(pendingCount),
    recentDecisions: recentDecisions.map((r) => ({
      id: r.id, category: r.category, amountInCompanyCurrency: parseFloat(r.amount_in_company_currency),
      decision: r.decision, decidedAt: r.decided_at, comment: r.comment, employeeName: r.employee_name,
    })),
    teamMembers: teamMembers.map((u) => ({
      id: u.id, name: u.name, email: u.email, isActive: u.is_active,
      pendingExpenses: parseInt(u.pendingExpenses),
    })),
  };
}

/* ── getEmployeeDashboard ────────────────────────────────── */
async function getEmployeeDashboard(employeeId, companyId) {
  const [summary] = await db('expenses')
    .where({ employee_id: employeeId, company_id: companyId })
    .select(
      db.raw(`COUNT(*) FILTER (WHERE status = 'pending')   AS "pendingCount"`),
      db.raw(`COUNT(*) FILTER (WHERE status = 'approved')  AS "approvedCount"`),
      db.raw(`COUNT(*) FILTER (WHERE status = 'rejected')  AS "rejectedCount"`),
      db.raw(`SUM(amount_in_company_currency) FILTER (WHERE status = 'approved') AS "totalReimbursed"`),
      db.raw(`SUM(amount_in_company_currency) FILTER (WHERE status = 'pending')  AS "totalPending"`),
    );

  const recentExpenses = await db('expenses')
    .where({ employee_id: employeeId, company_id: companyId })
    .select('id', 'category', 'amount', 'currency_code', 'amount_in_company_currency',
      'expense_date', 'status', 'risk_score', 'created_at')
    .orderBy('created_at', 'desc')
    .limit(5);

  const byCategory = await db('expenses')
    .where({ employee_id: employeeId, company_id: companyId, status: 'approved' })
    .select('category',
      db.raw('COUNT(*) as count'),
      db.raw('SUM(amount_in_company_currency) as total'),
    )
    .groupBy('category');

  return {
    summary: {
      pendingCount:   parseInt(summary.pendingCount  || 0),
      approvedCount:  parseInt(summary.approvedCount || 0),
      rejectedCount:  parseInt(summary.rejectedCount || 0),
      totalApprovedAmount: parseFloat(summary.totalReimbursed || 0),
      totalPendingAmount:   parseFloat(summary.totalPending    || 0),
    },
    recentExpenses: recentExpenses.map((e) => ({
      id: e.id, category: e.category, amount: parseFloat(e.amount),
      currencyCode: e.currency_code, amountInCompanyCurrency: parseFloat(e.amount_in_company_currency),
      expenseDate: e.expense_date, status: e.status, riskScore: e.risk_score, createdAt: e.created_at,
    })),
    expensesByCategory: byCategory.map((r) => ({
      category: r.category, count: parseInt(r.count), total: parseFloat(r.total),
    })),
  };
}

module.exports = { getAdminDashboard, getManagerDashboard, getEmployeeDashboard };
