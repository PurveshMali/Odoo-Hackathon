const { db } = require('../../config/db');

function logAudit({ actorId, action, metadata = {} } = {}) {
  setImmediate(() => {
    db('audit_logs').insert({ actor_id: actorId, action, metadata: JSON.stringify(metadata) })
      .catch((e) => console.warn('[AUDIT]', e.message));
  });
}

/* ── Fetch steps for a rule ──────────────────────────────── */
async function getRuleSteps(ruleId) {
  return db('approval_rule_steps as ars')
    .join('users as u', 'u.id', 'ars.approver_id')
    .where('ars.rule_id', ruleId)
    .select('ars.id', 'ars.step_order', 'ars.approver_id', 'u.name as approver_name')
    .orderBy('ars.step_order', 'asc');
}

/* ── createRule ───────────────────────────────────────────── */
async function createRule(data, companyId, adminId) {
  const {
    name, description, category, min_amount, max_amount,
    is_manager_first, approval_type, percentage_threshold,
    specific_approver_id, steps = [],
  } = data;

  // Validate specific approver belongs to same company
  if (specific_approver_id) {
    const approver = await db('users')
      .where({ id: specific_approver_id, company_id: companyId, is_active: true })
      .first();
    if (!approver) {
      const e = new Error('Specific approver not found in your company.'); e.statusCode = 400; throw e;
    }
  }

  // Validate steps approvers belong to company
  for (const step of steps) {
    const approver = await db('users')
      .where({ id: step.approver_id, company_id: companyId, is_active: true }).first();
    if (!approver) {
      const e = new Error(`Step approver ${step.approver_id} not found in your company.`);
      e.statusCode = 400; throw e;
    }
  }

  return db.transaction(async (trx) => {
    const [rule] = await trx('approval_rules').insert({
      company_id:           companyId,
      name,
      description:          description || null,
      category:             category    || null,
      min_amount:           min_amount  || null,
      max_amount:           max_amount  || null,
      is_manager_first:     is_manager_first ?? false,
      approval_type,
      percentage_threshold: percentage_threshold || null,
      specific_approver_id: specific_approver_id || null,
      is_active:            true,
    }).returning('*');

    if (steps.length > 0) {
      const stepRows = steps.map((s) => ({
        rule_id:     rule.id,
        approver_id: s.approver_id,
        step_order:  s.step_order,
      }));
      await trx('approval_rule_steps').insert(stepRows);
    }

    logAudit({ actorId: adminId, action: 'APPROVAL_RULE_CREATED', metadata: { ruleId: rule.id, name } });

    rule.steps = await getRuleSteps(rule.id);
    return rule;
  });
}

/* ── getAllRules ───────────────────────────────────────────── */
async function getAllRules(companyId) {
  const rules = await db('approval_rules as ar')
    .leftJoin('users as spec', 'spec.id', 'ar.specific_approver_id')
    .where('ar.company_id', companyId)
    .select(
      'ar.id', 'ar.name', 'ar.description', 'ar.category',
      'ar.min_amount', 'ar.max_amount', 'ar.is_manager_first',
      'ar.approval_type', 'ar.percentage_threshold', 'ar.specific_approver_id',
      'ar.is_active', 'ar.created_at', 'ar.updated_at',
      'spec.name as specific_approver_name',
    )
    .orderBy('ar.created_at', 'desc');

  for (const rule of rules) {
    rule.steps = await getRuleSteps(rule.id);
  }
  return rules;
}

/* ── getRuleById ──────────────────────────────────────────── */
async function getRuleById(ruleId, companyId) {
  const rule = await db('approval_rules as ar')
    .leftJoin('users as spec', 'spec.id', 'ar.specific_approver_id')
    .where({ 'ar.id': ruleId, 'ar.company_id': companyId })
    .select(
      'ar.*',
      'spec.name as specific_approver_name',
    )
    .first();

  if (!rule) { const e = new Error('Approval rule not found.'); e.statusCode = 404; throw e; }
  rule.steps = await getRuleSteps(rule.id);
  return rule;
}

/* ── checkRuleHasActiveExpenses ──────────────────────────── */
async function checkRuleHasActiveExpenses(ruleId) {
  const [{ count }] = await db('expenses')
    .where({ approval_rule_id: ruleId })
    .whereIn('status', ['pending', 'in_review'])
    .count('id as count');
  return parseInt(count) > 0;
}

/* ── updateRule ───────────────────────────────────────────── */
async function updateRule(ruleId, data, companyId, adminId) {
  const rule = await getRuleById(ruleId, companyId);
  if (!rule.is_active) { const e = new Error('Cannot edit an inactive rule.'); e.statusCode = 400; throw e; }

  const hasActive = await checkRuleHasActiveExpenses(ruleId);
  if (hasActive) {
    const e = new Error('Cannot edit a rule with active pending expenses. Deactivate it and create a new one.');
    e.statusCode = 400; throw e;
  }

  const { name, description, category, min_amount, max_amount, is_manager_first, steps } = data;

  return db.transaction(async (trx) => {
    const updatePayload = {};
    if (name           !== undefined) updatePayload.name             = name;
    if (description    !== undefined) updatePayload.description      = description;
    if (category       !== undefined) updatePayload.category         = category;
    if (min_amount     !== undefined) updatePayload.min_amount       = min_amount;
    if (max_amount     !== undefined) updatePayload.max_amount       = max_amount;
    if (is_manager_first !== undefined) updatePayload.is_manager_first = is_manager_first;

    if (Object.keys(updatePayload).length > 0) {
      await trx('approval_rules').where({ id: ruleId }).update(updatePayload);
    }

    if (steps !== undefined) {
      await trx('approval_rule_steps').where({ rule_id: ruleId }).delete();
      if (steps.length > 0) {
        await trx('approval_rule_steps').insert(
          steps.map((s) => ({ rule_id: ruleId, approver_id: s.approver_id, step_order: s.step_order }))
        );
      }
    }

    logAudit({ actorId: adminId, action: 'APPROVAL_RULE_UPDATED', metadata: { ruleId } });
    return getRuleById(ruleId, companyId);
  });
}

/* ── deactivateRule ───────────────────────────────────────── */
async function deactivateRule(ruleId, companyId, adminId) {
  await getRuleById(ruleId, companyId); // existence check

  const hasActive = await checkRuleHasActiveExpenses(ruleId);
  if (hasActive) {
    const e = new Error('Cannot deactivate a rule with active pending expenses.');
    e.statusCode = 400; throw e;
  }

  await db('approval_rules').where({ id: ruleId }).update({ is_active: false });
  logAudit({ actorId: adminId, action: 'APPROVAL_RULE_DEACTIVATED', metadata: { ruleId } });
  return { message: 'Rule deactivated successfully.' };
}

module.exports = { createRule, getAllRules, getRuleById, updateRule, deactivateRule };
