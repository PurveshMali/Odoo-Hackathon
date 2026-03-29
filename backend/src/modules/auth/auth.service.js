const bcrypt     = require('bcryptjs');
const crypto     = require('crypto');
const axios      = require('axios');

const { db }               = require('../../config/db');
const { signAccessToken, signRefreshToken } = require('../../config/jwt');

const SALT_ROUNDS = 12;
// Keep only the latest 3 active refresh tokens per user
const MAX_ACTIVE_REFRESH_TOKENS = 3;

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */

/** SHA-256 hash of a raw token string */
function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/** Fetches currency info from restcountries API. Falls back to USD. */
async function fetchCurrencyByCountry(countryName) {
  try {
    const url      = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=name,currencies`;
    const response = await axios.get(url, { timeout: 5000 });
    const data     = response.data;

    if (!data || !data[0] || !data[0].currencies) {
      throw new Error('No currency data');
    }

    const currencyCode   = Object.keys(data[0].currencies)[0];
    const currencySymbol = data[0].currencies[currencyCode].symbol || currencyCode;

    return { currencyCode, currencySymbol };
  } catch (err) {
    console.warn(`[AUTH] Could not fetch currency for "${countryName}": ${err.message}. Defaulting to USD.`);
    return { currencyCode: 'USD', currencySymbol: '$' };
  }
}

/** Issues both tokens, stores refresh token hash in DB, returns { accessToken, rawRefreshToken } */
async function issueTokenPair(user, ipAddress, userAgent) {
  const accessPayload = {
    userId:    user.id,
    companyId: user.company_id,
    role:      user.role,
    email:     user.email,
  };

  const accessToken      = signAccessToken(accessPayload);
  const rawRefreshToken  = signRefreshToken({ userId: user.id });
  const tokenHash        = hashToken(rawRefreshToken);
  const expiresAt        = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db('refresh_tokens').insert({
    user_id:    user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
    is_revoked: false,
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
  });

  // Keep only the latest MAX_ACTIVE_REFRESH_TOKENS per user (delete older ones)
  const activeTokens = await db('refresh_tokens')
    .where({ user_id: user.id, is_revoked: false })
    .orderBy('created_at', 'desc')
    .select('id');

  if (activeTokens.length > MAX_ACTIVE_REFRESH_TOKENS) {
    const idsToRevoke = activeTokens.slice(MAX_ACTIVE_REFRESH_TOKENS).map((t) => t.id);
    await db('refresh_tokens').whereIn('id', idsToRevoke).update({ is_revoked: true });
  }

  return { accessToken, rawRefreshToken };
}

/* ─────────────────────────────────────────────────────────
   SERVICE FUNCTIONS
───────────────────────────────────────────────────────── */

/**
 * Signup:
 * 1. Check global email uniqueness
 * 2. Hash password
 * 3. Fetch country currency
 * 4. Create company
 * 5. Create admin user
 * 6. Issue token pair
 */
async function signup({ companyName, country, name, email, password, ipAddress, userAgent }) {
  // 1. Global email uniqueness check
  const existing = await db('users')
    .where({ email })
    .select('id')
    .first();

  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.statusCode = 409;
    throw err;
  }

  // 2. Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // 3. Fetch currency
  const { currencyCode, currencySymbol } = await fetchCurrencyByCountry(country);

  // 4. Create company
  const [company] = await db('companies')
    .insert({
      name:            companyName,
      country,
      currency_code:   currencyCode,
      currency_symbol: currencySymbol,
    })
    .returning([
      'id', 'name', 'country', 'currency_code', 'currency_symbol',
    ]);

  // 5. Create admin user
  const [user] = await db('users')
    .insert({
      company_id:    company.id,
      name,
      email,
      password_hash: passwordHash,
      role:          'admin',
    })
    .returning([
      'id', 'company_id', 'name', 'email', 'role',
      'is_active', 'is_email_verified', 'created_at',
    ]);

  // 6. Issue tokens
  const { accessToken, rawRefreshToken } = await issueTokenPair(user, ipAddress, userAgent);

  return {
    accessToken,
    rawRefreshToken,
    user: {
      id:    user.id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      company: {
        id:             company.id,
        name:           company.name,
        country:        company.country,
        currencyCode:   company.currency_code,
        currencySymbol: company.currency_symbol,
      },
    },
  };
}

/**
 * Login:
 * 1. Find user by email
 * 2. Check is_active
 * 3. Verify password
 * 4. Update last_login_at
 * 5. Issue token pair
 */
async function login({ email, password, ipAddress, userAgent }) {
  // 1. Find user with company info
  const user = await db('users')
    .where('users.email', email)
    .join('companies', 'users.company_id', 'companies.id')
    .select(
      'users.id',
      'users.company_id',
      'users.name',
      'users.email',
      'users.password_hash',
      'users.role',
      'users.is_active',
      'users.last_login_at',
      'companies.name        as company_name',
      'companies.currency_code   as currency_code',
      'companies.currency_symbol as currency_symbol',
    )
    .first();

  if (!user) {
    const err = new Error('Invalid credentials.');
    err.statusCode = 401;
    throw err;
  }

  // 2. Check active
  if (!user.is_active) {
    const err = new Error('Account deactivated. Contact your administrator.');
    err.statusCode = 401;
    throw err;
  }

  // 3. Verify password (constant-time comparison)
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const err = new Error('Invalid credentials.');
    err.statusCode = 401;
    throw err;
  }

  // 4. Update last_login_at
  await db('users').where({ id: user.id }).update({ last_login_at: db.fn.now() });

  // 5. Issue tokens
  const { accessToken, rawRefreshToken } = await issueTokenPair(user, ipAddress, userAgent);

  return {
    accessToken,
    rawRefreshToken,
    user: {
      id:          user.id,
      name:        user.name,
      email:       user.email,
      role:        user.role,
      lastLoginAt: user.last_login_at,
      company: {
        id:             user.company_id,
        name:           user.company_name,
        currencyCode:   user.currency_code,
        currencySymbol: user.currency_symbol,
      },
    },
  };
}

/**
 * Refresh token rotation:
 * 1. Verify refresh token signature
 * 2. Find token hash in DB
 * 3. Validate not revoked / not expired
 * 4. Revoke old token, issue new pair
 */
async function refreshToken({ rawToken, ipAddress, userAgent }) {
  const { verifyRefreshToken } = require('../../config/jwt');

  // 1. Verify signature
  let decoded;
  try {
    decoded = verifyRefreshToken(rawToken);
  } catch {
    const err = new Error('Refresh token is invalid or expired.');
    err.statusCode = 401;
    throw err;
  }

  // 2. Find stored token by hash
  const tokenHash   = hashToken(rawToken);
  const storedToken = await db('refresh_tokens')
    .where({ token_hash: tokenHash })
    .select('id', 'user_id', 'is_revoked', 'expires_at')
    .first();

  if (!storedToken) {
    const err = new Error('Refresh token not recognised. Please log in again.');
    err.statusCode = 401;
    throw err;
  }

  // 3. Check revoked / expired
  if (storedToken.is_revoked) {
    // Token reuse detected — revoke ALL tokens for this user (security measure)
    await db('refresh_tokens').where({ user_id: storedToken.user_id }).update({ is_revoked: true });
    const err = new Error('Refresh token has been revoked. Please log in again.');
    err.statusCode = 401;
    throw err;
  }

  if (new Date(storedToken.expires_at) < new Date()) {
    const err = new Error('Refresh token has expired. Please log in again.');
    err.statusCode = 401;
    throw err;
  }

  // 4. Load user
  const user = await db('users')
    .where({ 'users.id': storedToken.user_id })
    .select('id', 'company_id', 'email', 'role', 'is_active')
    .first();

  if (!user || !user.is_active) {
    const err = new Error('Account not found or deactivated.');
    err.statusCode = 401;
    throw err;
  }

  // Revoke old token
  await db('refresh_tokens').where({ id: storedToken.id }).update({ is_revoked: true });

  // Issue new pair (rotation)
  const { accessToken, rawRefreshToken: newRawRefreshToken } = await issueTokenPair(user, ipAddress, userAgent);

  return { accessToken, rawRefreshToken: newRawRefreshToken };
}

/**
 * Logout:
 * 1. Hash incoming token and mark as revoked
 */
async function logout({ rawToken }) {
  if (!rawToken) return;

  const tokenHash = hashToken(rawToken);

  await db('refresh_tokens')
    .where({ token_hash: tokenHash })
    .update({ is_revoked: true });
}

/**
 * Get current user with company data.
 */
async function getMe(userId) {
  const user = await db('users')
    .where('users.id', userId)
    .join('companies', 'users.company_id', 'companies.id')
    .select(
      'users.id',
      'users.name',
      'users.email',
      'users.role',
      'users.is_active',
      'users.is_email_verified',
      'users.last_login_at',
      'users.permissions',
      'users.metadata',
      'users.created_at',
      'users.company_id',
      'companies.name           as company_name',
      'companies.country        as company_country',
      'companies.currency_code  as currency_code',
      'companies.currency_symbol as currency_symbol',
      'companies.is_active      as company_is_active',
    )
    .first();

  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return {
    id:              user.id,
    name:            user.name,
    email:           user.email,
    role:            user.role,
    isActive:        user.is_active,
    isEmailVerified: user.is_email_verified,
    lastLoginAt:     user.last_login_at,
    permissions:     user.permissions,
    metadata:        user.metadata,
    createdAt:       user.created_at,
    company: {
      id:             user.company_id,
      name:           user.company_name,
      country:        user.company_country,
      currencyCode:   user.currency_code,
      currencySymbol: user.currency_symbol,
      isActive:       user.company_is_active,
    },
  };
}

module.exports = { signup, login, refreshToken, logout, getMe };
