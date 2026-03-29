/**
 * OCR Utility — Tesseract.js
 * Extracts structured data from receipt images.
 * NEVER throws — returns {} on any error.
 */

let Tesseract;
try {
  Tesseract = require('tesseract.js');
} catch {
  console.warn('[OCR] tesseract.js not installed — OCR disabled');
}

/**
 * extractReceiptData(imagePath)
 * Returns: { extracted_amount, extracted_date, extracted_vendor,
 *             extracted_description, ocr_confidence, raw_text }
 */
async function extractReceiptData(imagePath) {
  if (!Tesseract) return {};

  try {
    // Normalize Windows backslashes
    const normalizedPath = imagePath.replace(/\\/g, '/');

    let text = '';
    let confidence = 0;

    // Support both tesseract.js v2 (Tesseract.recognize) and v4+ (createWorker)
    if (typeof Tesseract.recognize === 'function') {
      const { data } = await Tesseract.recognize(normalizedPath, 'eng', {
        logger: () => {},
      });
      text       = data.text        || '';
      confidence = data.confidence  || 0;
    } else if (typeof Tesseract.createWorker === 'function') {
      const worker = await Tesseract.createWorker('eng');
      const { data } = await worker.recognize(normalizedPath);
      text       = data.text        || '';
      confidence = data.confidence  || 0;
      await worker.terminate();
    } else {
      return {};
    }

    const rawText = text.trim();

    // Extract amount (e.g. $450, ₹1,200, 450.00)
    const amountMatch = rawText.match(
      /(?:total|amount|subtotal|grand total|sum)?[\s:]*(?:[$₹€£¥])\s*([\d,]+\.?\d*)/i
    ) || rawText.match(/([\d,]+\.?\d{2})\s*(?:[$₹€£¥])/);
    const extractedAmount = amountMatch
      ? parseFloat((amountMatch[1] || amountMatch[2] || '').replace(/,/g, ''))
      : null;

    // Extract date
    const dateMatch = rawText.match(
      /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/
    ) || rawText.match(
      /\b(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})\b/
    );
    const extractedDate = dateMatch ? dateMatch[1].trim() : null;

    // First non-empty line = vendor name
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const extractedVendor = lines[0] || null;

    return {
      extracted_amount:      extractedAmount,
      extracted_date:        extractedDate,
      extracted_vendor:      extractedVendor,
      extracted_description: lines.slice(0, 3).join(' ').substring(0, 200),
      ocr_confidence:        parseFloat((confidence / 100).toFixed(2)),
      raw_text:              rawText.substring(0, 1000),
    };
  } catch (err) {
    console.warn('[OCR] Extraction failed:', err.message);
    return {};
  }
}

module.exports = { extractReceiptData };
