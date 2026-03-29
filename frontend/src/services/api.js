import { API_BASE } from '../constants/api';

/** Centralized fetch wrapper — auto-attaches Bearer token, handles auth errors */
async function request(path, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // If Content-Type is explicitly undefined, let fetch set it (useful for FormData)
  if (headers['Content-Type'] === undefined) {
    delete headers['Content-Type'];
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Server returned invalid JSON. Is the backend running?');
  }

  if (res.status === 401) {
    // Token expired — clear storage and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    return;
  }

  if (!res.ok || !data.success) {
    const error = new Error(data?.message || `Request failed (${res.status})`);
    error.statusCode = res.status;
    throw error;
  }

  return data.data;
}

/* ────────────── Auth ────────────── */
export const authApi = {
  me:             ()       => request('/api/auth/me'),
  changePassword: (body)   => request('/api/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
  logout:         ()       => request('/api/auth/logout', { method: 'POST' }),
};

/* ────────────── Users ────────────── */
export const usersApi = {
  list:            (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null))
    ).toString();
    return request(`/api/users${qs ? `?${qs}` : ''}`);
  },
  create:          (body)   => request('/api/users', { method: 'POST', body: JSON.stringify(body) }),
  getManagers:     ()       => request('/api/users/managers'),
  getById:         (id)     => request(`/api/users/${id}`),
  update:          (id, b)  => request(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(b) }),
  deactivate:      (id)     => request(`/api/users/${id}/deactivate`, { method: 'PATCH' }),
  reactivate:      (id)     => request(`/api/users/${id}/reactivate`, { method: 'PATCH' }),
  sendCredentials: (id)     => request(`/api/users/${id}/send-credentials`, { method: 'POST' }),
};

/* ────────────── Expenses ────────────── */
export const expensesApi = {
  ocr: (file) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return request('/api/expenses/ocr', { method: 'POST', body: formData, headers: { 'Content-Type': undefined } });
  },
  submit: (body, file) => {
    const formData = new FormData();
    Object.entries(body).forEach(([k, v]) => formData.append(k, v));
    if (file) formData.append('receipt', file);
    return request('/api/expenses', { method: 'POST', body: formData, headers: { 'Content-Type': undefined } });
  },
  list: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null))
    ).toString();
    return request(`/api/expenses${qs ? `?${qs}` : ''}`);
  },
  getById: (id)     => request(`/api/expenses/${id}`),
  cancel:  (id)     => request(`/api/expenses/${id}/cancel`, { method: 'PATCH' }),
};

/* ────────────── Approvals ────────────── */
export const approvalsApi = {
  pending: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null))
    ).toString();
    return request(`/api/approvals/pending${qs ? `?${qs}` : ''}`);
  },
  approve: (id, comment) => request(`/api/approvals/${id}/approve`, { method: 'POST', body: JSON.stringify({ comment }) }),
  reject:  (id, comment) => request(`/api/approvals/${id}/reject`,  { method: 'POST', body: JSON.stringify({ comment }) }),
  timeline: (id)         => request(`/api/approvals/${id}/timeline`),
};

/* ────────────── Approval Rules ────────────── */
export const rulesApi = {
  list:   ()       => request('/api/approval-rules'),
  create: (body)   => request('/api/approval-rules', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, b)  => request(`/api/approval-rules/${id}`, { method: 'PATCH', body: JSON.stringify(b) }),
  delete: (id)     => request(`/api/approval-rules/${id}`, { method: 'DELETE' }),
};

/* ────────────── Dashboards ────────────── */
export const dashboardApi = {
  getAdmin:    () => request('/api/dashboard/admin'),
  getManager:  () => request('/api/dashboard/manager'),
  getEmployee: () => request('/api/dashboard/employee'),
};

