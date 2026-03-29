const bcrypt = require('bcryptjs');
const { db }  = require('../../config/db');
const { generateRandomPassword } = require('../../utils/passwordUtils');
const { sendCredentialsEmail }   = require('../../config/email');

const SALT_ROUNDS = 12;

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */

/** Fire-and-forget audit log — never throws */
function logAudit({ actorId, action, metadata, ipAddress }) {
  setImmediate(() => {
    db('audit_logs')
      .insert({
        actor_id:   actorId,
        action,
        ip_address: ipAddress || null,
        metadata:   JSON.stringify(metadata || {}),
      })
      .catch((err) => console.warn('[AUDIT] Failed to write audit log:', err.message));
  });
}

/* ─────────────────────────────────────────────────────────
   1. createUser
───────────────────────────────────────────────────────── */
async function createUser(data, companyId, adminId) {
  const { name, email, role, managerId } = data;

  // Guard: admin cannot create another admin via this API
  if (role === 'admin') {
    const err = new Error('Cannot create admin users through this endpoint.');
    err.statusCode = 403;
    throw err;
  }

  // 1. Email uniqueness within company
  const existing = await db('users')
    .where({ email, company_id: companyId })
    .select('id')
    .first();

  if (existing) {
    const err = new Error('A user with this email already exists in this company.');
    err.statusCode = 409;
    throw err;
  }

  // 2. Validate managerId if provided
  if (managerId) {
    const manager = await db('users')
      .where({ id: managerId, company_id: companyId, is_active: true })
      .select('id', 'role')
      .first();

    if (!manager) {
      const err = new Error('Manager not found in this company.');
      err.statusCode = 404;
      throw err;
    }
    if (manager.role === 'employee') {
      const err = new Error('An employee cannot be assigned as a manager.');
      err.statusCode = 400;
      throw err;
    }
  }

  // 3. Temporary hashed password — unusable until admin sends credentials
  const tempHash = await bcrypt.hash(`TEMP_${Date.now()}`, SALT_ROUNDS);

  // 4. Insert user
  const [newUser] = await db('users')
    .insert({
      company_id:           companyId,
      name,
      email,
      password_hash:        tempHash,
      role,
      manager_id:           managerId || null,
      is_active:            true,
      must_change_password: true,
    })
    .returning([
      'id', 'name', 'email', 'role',
      'manager_id', 'is_active', 'must_change_password', 'created_at',
    ]);

  // 5. Audit log (fire-and-forget)
  logAudit({
    actorId:   adminId,
    action:    'USER_CREATED',
    metadata:  { entityType: 'user', entityId: newUser.id, role, createdBy: adminId },
  });

  return {
    id:                 newUser.id,
    name:               newUser.name,
    email:              newUser.email,
    role:               newUser.role,
    managerId:          newUser.manager_id,
    isActive:           newUser.is_active,
    mustChangePassword: newUser.must_change_password,
    createdAt:          newUser.created_at,
  };
}

/* ─────────────────────────────────────────────────────────
   2. getAllUsers (paginated + filtered)
───────────────────────────────────────────────────────── */
async function getAllUsers(companyId, filters = {}) {
  const page   = Math.max(1, parseInt(filters.page  || 1,  10));
  const limit  = Math.min(50, Math.max(1, parseInt(filters.limit || 10, 10)));
  const offset = (page - 1) * limit;

  // Base query builder — reused for both data + count
  const buildQuery = () => {
    let q = db('users as u')
      .where('u.company_id', companyId)
      .leftJoin('users as m', 'm.id', 'u.manager_id');

    if (filters.role !== undefined && filters.role !== '') {
      q = q.where('u.role', filters.role);
    }
    if (filters.isActive !== undefined && filters.isActive !== '') {
      const active = filters.isActive === 'true' || filters.isActive === true;
      q = q.where('u.is_active', active);
    }
    if (filters.search) {
      const term = `%${filters.search}%`;
      q = q.where((builder) => {
        builder.whereILike('u.name', term).orWhereILike('u.email', term);
      });
    }

    return q;
  };

  // Data query
  const users = await buildQuery()
    .select(
      'u.id',
      'u.name',
      'u.email',
      'u.role',
      'u.is_active',
      'u.last_login_at',
      'u.must_change_password',
      'u.password_sent_at',
      'u.created_at',
      'm.id   as manager_id',
      'm.name as manager_name',
    )
    .orderBy('u.created_at', 'desc')
    .limit(limit)
    .offset(offset);

  // Count query (same filters, no pagination)
  const [{ count }] = await buildQuery().count('u.id as count');
  const total = parseInt(count, 10);

  return {
    users: users.map((u) => ({
      id:                 u.id,
      name:               u.name,
      email:              u.email,
      role:               u.role,
      isActive:           u.is_active,
      lastLoginAt:        u.last_login_at,
      mustChangePassword: u.must_change_password,
      passwordSentAt:     u.password_sent_at,
      createdAt:          u.created_at,
      managerId:          u.manager_id,
      managerName:        u.manager_name,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/* ─────────────────────────────────────────────────────────
   3. getManagers
───────────────────────────────────────────────────────── */
async function getManagers(companyId) {
  const managers = await db('users')
    .where({ company_id: companyId, role: 'manager', is_active: true })
    .select('id', 'name', 'email')
    .orderBy('name', 'asc');

  return managers;
}

/* ─────────────────────────────────────────────────────────
   4. getUserById
───────────────────────────────────────────────────────── */
async function getUserById(userId, companyId) {
  const user = await db('users as u')
    .where('u.id', userId)
    .where('u.company_id', companyId)
    .leftJoin('users as m', 'm.id', 'u.manager_id')
    .select(
      'u.id',
      'u.name',
      'u.email',
      'u.role',
      'u.is_active',
      'u.is_email_verified',
      'u.last_login_at',
      'u.must_change_password',
      'u.password_sent_at',
      'u.permissions',
      'u.metadata',
      'u.created_at',
      'u.updated_at',
      'm.id    as manager_id',
      'm.name  as manager_name',
      'm.email as manager_email',
    )
    .first();

  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return {
    id:                 user.id,
    name:               user.name,
    email:              user.email,
    role:               user.role,
    isActive:           user.is_active,
    isEmailVerified:    user.is_email_verified,
    lastLoginAt:        user.last_login_at,
    mustChangePassword: user.must_change_password,
    passwordSentAt:     user.password_sent_at,
    permissions:        user.permissions,
    metadata:           user.metadata,
    createdAt:          user.created_at,
    updatedAt:          user.updated_at,
    manager: user.manager_id
      ? { id: user.manager_id, name: user.manager_name, email: user.manager_email }
      : null,
  };
}

/* ─────────────────────────────────────────────────────────
   5. updateUser
───────────────────────────────────────────────────────── */
async function updateUser(userId, data, companyId, adminId) {
  // 1. Fetch existing user
  const existing = await db('users')
    .where({ id: userId, company_id: companyId })
    .select('id', 'role')
    .first();

  if (!existing) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  // 2. Role immutability for admin accounts
  if (data.role) {
    if (existing.role === 'admin') {
      const err = new Error('Cannot change the role of an admin account.');
      err.statusCode = 403;
      throw err;
    }
    if (data.role === 'admin') {
      const err = new Error('Cannot promote a user to admin via this endpoint.');
      err.statusCode = 403;
      throw err;
    }
  }

  // 3. Validate managerId if being updated
  if (data.managerId !== undefined && data.managerId !== null) {
    if (data.managerId === userId) {
      const err = new Error('A user cannot be their own manager.');
      err.statusCode = 400;
      throw err;
    }

    const manager = await db('users')
      .where({ id: data.managerId, company_id: companyId, is_active: true })
      .select('id', 'role')
      .first();

    if (!manager) {
      const err = new Error('Manager not found in this company.');
      err.statusCode = 404;
      throw err;
    }
    if (manager.role === 'employee') {
      const err = new Error('An employee cannot be assigned as a manager.');
      err.statusCode = 400;
      throw err;
    }
  }

  // 4. Build update object — only provided fields
  const updates = {};
  if (data.name      !== undefined) updates.name       = data.name;
  if (data.role      !== undefined) updates.role       = data.role;
  if ('managerId' in data)          updates.manager_id = data.managerId || null;

  // 5. Run update (updated_at handled by DB trigger)
  const [updated] = await db('users')
    .where({ id: userId, company_id: companyId })
    .update(updates)
    .returning(['id', 'name', 'email', 'role', 'manager_id', 'is_active', 'updated_at']);

  // 6. Audit log
  logAudit({
    actorId:  adminId,
    action:   'USER_UPDATED',
    metadata: { entityType: 'user', entityId: userId, changes: data, updatedBy: adminId },
  });

  return {
    id:        updated.id,
    name:      updated.name,
    email:     updated.email,
    role:      updated.role,
    managerId: updated.manager_id,
    isActive:  updated.is_active,
    updatedAt: updated.updated_at,
  };
}

/* ─────────────────────────────────────────────────────────
   6. deactivateUser
───────────────────────────────────────────────────────── */
async function deactivateUser(userId, companyId, adminId) {
  const user = await db('users')
    .where({ id: userId, company_id: companyId })
    .select('id', 'role', 'is_active')
    .first();

  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  if (user.role === 'admin') {
    const err = new Error('Cannot deactivate an admin account.');
    err.statusCode = 403;
    throw err;
  }
  if (!user.is_active) {
    const err = new Error('User is already inactive.');
    err.statusCode = 400;
    throw err;
  }

  // Transaction: deactivate + revoke all sessions atomically
  await db.transaction(async (trx) => {
    await trx('users').where({ id: userId }).update({ is_active: false });
    await trx('refresh_tokens').where({ user_id: userId }).update({ is_revoked: true });
  });

  logAudit({
    actorId:  adminId,
    action:   'USER_DEACTIVATED',
    metadata: { entityType: 'user', entityId: userId, deactivatedBy: adminId },
  });

  return { message: 'User deactivated successfully.' };
}

/* ─────────────────────────────────────────────────────────
   7. reactivateUser
───────────────────────────────────────────────────────── */
async function reactivateUser(userId, companyId, adminId) {
  const user = await db('users')
    .where({ id: userId, company_id: companyId })
    .select('id', 'role', 'is_active')
    .first();

  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  if (user.is_active) {
    const err = new Error('User is already active.');
    err.statusCode = 400;
    throw err;
  }

  await db('users').where({ id: userId }).update({ is_active: true });

  logAudit({
    actorId:  adminId,
    action:   'USER_REACTIVATED',
    metadata: { entityType: 'user', entityId: userId, reactivatedBy: adminId },
  });

  return { message: 'User reactivated successfully. Send credentials to allow login.' };
}

/* ─────────────────────────────────────────────────────────
   LEGACY — listCompanyUsers (kept for backward compat)
   Wraps getAllUsers with no filters
───────────────────────────────────────────────────────── */
async function listCompanyUsers(adminId) {
  const admin = await db('users').where({ id: adminId }).select('company_id').first();
  if (!admin) {
    const err = new Error('Admin not found.');
    err.statusCode = 404;
    throw err;
  }
  const result = await getAllUsers(admin.company_id, { limit: 50 });
  return result.users;
}

/* ─────────────────────────────────────────────────────────
   sendCredentials (existing — unchanged)
───────────────────────────────────────────────────────── */
async function sendCredentials(targetUserId, adminId, ipAddress) {
  const admin = await db('users').where({ id: adminId }).select('company_id').first();
  if (!admin) {
    const err = new Error('Admin user not found.');
    err.statusCode = 404;
    throw err;
  }

  const targetUser = await db('users')
    .where({ id: targetUserId, company_id: admin.company_id, is_active: true })
    .select('id', 'name', 'email', 'company_id', 'password_sent_at')
    .first();

  if (!targetUser) {
    const err = new Error('User not found or does not belong to your company.');
    err.statusCode = 404;
    throw err;
  }

  if (targetUser.password_sent_at) {
    const lastSentAt    = new Date(targetUser.password_sent_at);
    // Reduced to 10 seconds for easier dev testing
    const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
    if (lastSentAt > tenSecondsAgo) {
      const err = new Error('Credentials were recently sent. Please wait a few seconds before sending again.');
      err.statusCode = 429;
      throw err;
    }
  }

  const rawPassword  = generateRandomPassword(12);
  const passwordHash = await bcrypt.hash(rawPassword, SALT_ROUNDS);
  const sentAt       = new Date();

  await db.transaction(async (trx) => {
    await trx('users').where({ id: targetUserId }).update({
      password_hash:        passwordHash,
      must_change_password: true,
      password_sent_at:     sentAt,
    });
    await trx('credential_send_logs').insert({
      user_id:       targetUserId,
      sent_by:       adminId,
      sent_to_email: targetUser.email,
      ip_address:    ipAddress || null,
    });
    await trx('refresh_tokens').where({ user_id: targetUserId }).update({ is_revoked: true });
  });

  const company = await db('companies').where({ id: targetUser.company_id }).select('name').first();

  await sendCredentialsEmail({
    toEmail:     targetUser.email,
    userName:    targetUser.name,
    password:    rawPassword,
    companyName: company?.name || 'Your Company',
    loginUrl:    `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`,
  });

  return { sentTo: targetUser.email, sentAt: sentAt.toISOString() };
}

module.exports = {
  createUser,
  getAllUsers,
  getManagers,
  getUserById,
  updateUser,
  deactivateUser,
  reactivateUser,
  sendCredentials,
  listCompanyUsers, // legacy
};
