/**
 * Fraud Detection Engine
 * Calculates a risk score (0–100) for an expense.
 * NEVER throws — errors are caught and ignored.
 * Returns: { riskScore, flags, isFlaggedForReview }
 */

const { db } = require('../config/db');

async function calculateFraudRisk({ expense, employeeId, companyId, receiptHash, ocrData }) {
  let riskScore = 0;
  const flags   = [];

  try {
    // ── CHECK 1: DUPLICATE RECEIPT ─────────────────────────────────
    if (receiptHash) {
      // Same receipt submitted by a DIFFERENT employee
      const crossDuplicate = await db('expenses')
        .where({ company_id: companyId, receipt_hash: receiptHash })
        .whereNot({ employee_id: employeeId })
        .select('id')
        .first();

      if (crossDuplicate) {
        riskScore += 40;
        flags.push({
          type: 'DUPLICATE_RECEIPT', severity: 'high',
          detail: 'This receipt image was already submitted by another employee.',
        });
      }

      // Same receipt submitted by THE SAME employee previously
      const selfDuplicate = await db('expenses')
        .where({ company_id: companyId, receipt_hash: receiptHash, employee_id: employeeId })
        .whereNotIn('status', ['draft', 'cancelled'])
        .select('id')
        .first();

      if (selfDuplicate) {
        riskScore += 40;
        flags.push({
          type: 'DUPLICATE_RECEIPT', severity: 'high',
          detail: 'You have already submitted this receipt before.',
        });
      }
    }

    // ── CHECK 2: AMOUNT MISMATCH (OCR vs submitted) ─────────────────
    if (ocrData?.extracted_amount && expense.amount) {
      const submitted = parseFloat(expense.amount);
      const extracted = parseFloat(ocrData.extracted_amount);
      if (extracted > 0) {
        const diff = Math.abs(submitted - extracted) / extracted;
        if (diff > 0.10) {
          riskScore += 25;
          flags.push({
            type: 'AMOUNT_MISMATCH', severity: 'medium',
            detail: `Submitted amount (${submitted}) differs from receipt OCR amount (${extracted}) by ${(diff * 100).toFixed(1)}%.`,
          });
        }
      }
    }

    // ── CHECK 3: ROUND NUMBER ───────────────────────────────────────
    const amount = parseFloat(expense.amount);
    if (amount >= 1000 && amount % 100 === 0) {
      riskScore += 10;
      flags.push({
        type: 'ROUND_NUMBER', severity: 'low',
        detail: `Expense amount is a suspicious round number (${amount}).`,
      });
    }

    // ── CHECK 4: WEEKEND EXPENSE ────────────────────────────────────
    const day = new Date(expense.expense_date).getDay();
    if (day === 0 || day === 6) {
      riskScore += 10;
      flags.push({
        type: 'WEEKEND_EXPENSE', severity: 'low',
        detail: `Expense is dated on a ${day === 0 ? 'Sunday' : 'Saturday'}.`,
      });
    }

    // ── CHECK 5: HIGH FREQUENCY VENDOR ─────────────────────────────
    if (ocrData?.extracted_vendor) {
      const vendor        = ocrData.extracted_vendor.substring(0, 50);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0];

      const [{ count }] = await db('expenses')
        .where({ employee_id: employeeId })
        .whereRaw(`ocr_data->>'extracted_vendor' ILIKE ?`, [`%${vendor}%`])
        .where('expense_date', '>=', thirtyDaysAgo)
        .whereIn('status', ['pending', 'approved', 'in_review'])
        .count('id as count');

      if (parseInt(count) >= 3) {
        riskScore += 20;
        flags.push({
          type: 'HIGH_FREQUENCY_VENDOR', severity: 'medium',
          detail: `This vendor appears ${count}+ times in your last 30 days.`,
        });
      }
    }

    // ── CHECK 6: STATISTICAL ANOMALY ───────────────────────────────
    const [avgRow] = await db('expenses')
      .where({ employee_id: employeeId, category: expense.category, company_id: companyId })
      .whereIn('status', ['pending', 'approved'])
      .avg('amount_in_company_currency as avg_amount');

    const avgAmount     = parseFloat(avgRow?.avg_amount || 0);
    const currentAmount = parseFloat(expense.amount_in_company_currency || expense.amount);

    if (avgAmount > 0 && currentAmount > avgAmount * 2.5) {
      riskScore += 25;
      flags.push({
        type: 'STATISTICAL_ANOMALY', severity: 'medium',
        detail: `Amount is ${(currentAmount / avgAmount).toFixed(1)}× your average for ${expense.category} expenses.`,
      });
    }

    // ── CHECK 7: LOW OCR CONFIDENCE ─────────────────────────────────
    if (ocrData?.ocr_confidence !== undefined && ocrData.ocr_confidence < 0.5) {
      riskScore += 15;
      flags.push({
        type: 'OCR_CONFIDENCE_LOW', severity: 'low',
        detail: `Receipt scan quality is low (${(ocrData.ocr_confidence * 100).toFixed(0)}% confidence).`,
      });
    }

  } catch (err) {
    console.warn('[FRAUD] Non-fatal error during fraud check:', err.message);
  }

  riskScore = Math.min(riskScore, 100);

  return {
    riskScore,
    flags,
    isFlaggedForReview: riskScore >= 70,
  };
}

module.exports = { calculateFraudRisk };
