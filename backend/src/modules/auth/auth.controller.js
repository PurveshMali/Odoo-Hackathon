const authService          = require('./auth.service');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

/** Cookie config for the refresh token */
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

/* ─────────────────────────────────────────────────────────
   POST /api/auth/signup
───────────────────────────────────────────────────────── */
const signup = async (req, res, next) => {
  try {
    const { companyName, country, name, email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const result = await authService.signup({
      companyName, country, name, email, password,
      ipAddress, userAgent,
    });

    // Store refresh token in httpOnly cookie — never in response body
    res.cookie('refreshToken', result.rawRefreshToken, REFRESH_COOKIE_OPTIONS);

    return sendSuccess(
      res,
      'Company and admin account created successfully',
      { accessToken: result.accessToken, user: result.user },
      201
    );
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   POST /api/auth/login
───────────────────────────────────────────────────────── */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const result = await authService.login({ email, password, ipAddress, userAgent });

    res.cookie('refreshToken', result.rawRefreshToken, REFRESH_COOKIE_OPTIONS);

    return sendSuccess(res, 'Login successful', {
      accessToken:        result.accessToken,
      mustChangePassword: result.mustChangePassword, // ← frontend redirects to /change-password if true
      user:               result.user,
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   POST /api/auth/change-password  (protected)
───────────────────────────────────────────────────────── */
const changePassword = async (req, res, next) => {
  try {
    const userId          = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Pass current refresh token hash so that session can remain alive
    // while all OTHER device sessions are revoked
    const crypto           = require('crypto');
    const rawRefreshToken  = req.cookies?.refreshToken;
    const currentTokenHash = rawRefreshToken
      ? crypto.createHash('sha256').update(rawRefreshToken).digest('hex')
      : null;

    await authService.changePassword(userId, currentPassword, newPassword, currentTokenHash);

    return sendSuccess(res, 'Password changed successfully', null);
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   POST /api/auth/refresh
───────────────────────────────────────────────────────── */
const refresh = async (req, res, next) => {
  try {
    const rawToken  = req.cookies?.refreshToken;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    if (!rawToken) {
      return sendError(res, 'Refresh token not found. Please log in.', 401, null);
    }

    const result = await authService.refreshToken({ rawToken, ipAddress, userAgent });

    // Rotate cookie with new refresh token
    res.cookie('refreshToken', result.rawRefreshToken, REFRESH_COOKIE_OPTIONS);

    return sendSuccess(res, 'Access token refreshed', { accessToken: result.accessToken });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   POST /api/auth/logout
───────────────────────────────────────────────────────── */
const logout = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken;

    await authService.logout({ rawToken });

    // Clear the httpOnly cookie
    res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);

    return sendSuccess(res, 'Logged out successfully', null);
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   GET /api/auth/me  (protected)
───────────────────────────────────────────────────────── */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user   = await authService.getMe(userId);

    return sendSuccess(res, 'User retrieved successfully', { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, changePassword, refresh, logout, getMe };

