const crypto = require('crypto');

// Character pools — visually ambiguous chars removed for readability in emails
const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I, O
const LOWERCASE = 'abcdefghjkmnpqrstuvwxyz';   // no i, l, o
const NUMBERS   = '23456789';                   // no 0, 1
const SPECIAL   = '@#$%&*!';                    // safe subset — won't break emails/URLs

/**
 * Generates a cryptographically random password of a given length.
 * Guarantees at least 2 chars from each required category.
 * Uses crypto.randomInt (OS-level entropy) — NOT Math.random().
 *
 * @param {number} length - Total password length (default 12)
 * @returns {string} - Random password string
 */
const generateRandomPassword = (length = 12) => {
  // Guarantee at least 2 from each type (8 chars total)
  const guaranteed = [
    UPPERCASE[crypto.randomInt(UPPERCASE.length)],
    UPPERCASE[crypto.randomInt(UPPERCASE.length)],
    LOWERCASE[crypto.randomInt(LOWERCASE.length)],
    LOWERCASE[crypto.randomInt(LOWERCASE.length)],
    NUMBERS[crypto.randomInt(NUMBERS.length)],
    NUMBERS[crypto.randomInt(NUMBERS.length)],
    SPECIAL[crypto.randomInt(SPECIAL.length)],
    SPECIAL[crypto.randomInt(SPECIAL.length)],
  ];

  // Fill remaining chars from full pool
  const allChars  = UPPERCASE + LOWERCASE + NUMBERS + SPECIAL;
  const remaining = Array.from(
    { length: length - guaranteed.length },
    () => allChars[crypto.randomInt(allChars.length)]
  );

  // Fisher-Yates shuffle for uniform distribution
  const combined = [...guaranteed, ...remaining];
  for (let i = combined.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join('');
  // Example output: "Xk7@mR3!Tz9#"
};

module.exports = { generateRandomPassword };
