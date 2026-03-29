const usersService = require('./users.service');
const { sendSuccess } = require('../../utils/apiResponse');

/* ─────────────────────────────────────────────────────────
   POST /api/users — createUser (201)
───────────────────────────────────────────────────────── */
const createUser = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const adminId   = req.user.userId;
    const user = await usersService.createUser(req.body, companyId, adminId);
    return res.status(201).json({ success: true, message: 'User created successfully', data: { user } });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   GET /api/users — getAllUsers (200)
───────────────────────────────────────────────────────── */
const getAllUsers = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const result    = await usersService.getAllUsers(companyId, req.query);
    return sendSuccess(res, 'Users fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   GET /api/users/managers — getManagers (200)
───────────────────────────────────────────────────────── */
const getManagers = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const managers  = await usersService.getManagers(companyId);
    return sendSuccess(res, 'Managers fetched successfully', { managers });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   GET /api/users/:userId — getUserById (200)
───────────────────────────────────────────────────────── */
const getUserById = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const user      = await usersService.getUserById(req.params.userId, companyId);
    return sendSuccess(res, 'User fetched successfully', { user });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   PATCH /api/users/:userId — updateUser (200)
───────────────────────────────────────────────────────── */
const updateUser = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const adminId   = req.user.userId;
    const user      = await usersService.updateUser(req.params.userId, req.body, companyId, adminId);
    return sendSuccess(res, 'User updated successfully', { user });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   PATCH /api/users/:userId/deactivate — deactivateUser (200)
───────────────────────────────────────────────────────── */
const deactivateUser = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const adminId   = req.user.userId;
    const result    = await usersService.deactivateUser(req.params.userId, companyId, adminId);
    return sendSuccess(res, result.message, null);
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   PATCH /api/users/:userId/reactivate — reactivateUser (200)
───────────────────────────────────────────────────────── */
const reactivateUser = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const adminId   = req.user.userId;
    const result    = await usersService.reactivateUser(req.params.userId, companyId, adminId);
    return sendSuccess(res, result.message, null);
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   POST /api/users/:userId/send-credentials (200)
───────────────────────────────────────────────────────── */
const sendCredentials = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const adminId      = req.user.userId;
    const ipAddress    = req.ip;
    const result = await usersService.sendCredentials(targetUserId, adminId, ipAddress);
    return sendSuccess(res, "Credentials sent to user's email successfully", {
      sentTo: result.sentTo,
      sentAt: result.sentAt,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getManagers,
  getUserById,
  updateUser,
  deactivateUser,
  reactivateUser,
  sendCredentials,
};
