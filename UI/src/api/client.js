const API_BASE = '/api';

function getAuthHeaders() {
  const token = sessionStorage.getItem('civic_auth_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  getDemoUsers: async () => {
    const res = await fetch(`${API_BASE}/auth/demo-users`);
    return res.json();
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  },

  // Grievances
  getGrievances: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/grievances?${query}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch grievances');
    return res.json();
  },

  getGrievanceById: async (id) => {
    const res = await fetch(`${API_BASE}/grievances/${id}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Grievance not found');
    return res.json();
  },

  submitGrievance: async (payload) => {
    const res = await fetch(`${API_BASE}/grievances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit grievance');
    return data;
  },

  escalateGrievance: async (id, reason) => {
    const res = await fetch(`${API_BASE}/grievances/${id}/escalate`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to escalate');
    return data;
  },

  resolveGrievance: async (id, resolution_action) => {
    const res = await fetch(`${API_BASE}/grievances/${id}/resolve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ resolution_action })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resolve');
    return data;
  },

  updateGrievance: async (id, updates) => {
    const res = await fetch(`${API_BASE}/grievances/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update');
    return data;
  },

  resetDataset: async () => {
    const res = await fetch(`${API_BASE}/grievances/reset/default`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // AI Insights & Explanation
  getAIExplanation: async (id) => {
    const res = await fetch(`${API_BASE}/ai/explain/${id}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load AI explanation');
    return res.json();
  },

  getClusters: async () => {
    const res = await fetch(`${API_BASE}/ai/clusters`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load clusters');
    return res.json();
  },

  getRecurringIssues: async (department_id) => {
    const query = department_id ? `?department_id=${department_id}` : '';
    const res = await fetch(`${API_BASE}/ai/recurring${query}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load recurring issues');
    return res.json();
  },

  predictRouting: async (text) => {
    const res = await fetch(`${API_BASE}/ai/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return res.json();
  },

  evaluateTextPreview: async (payload) => {
    const res = await fetch(`${API_BASE}/ai/evaluate-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Analytics
  getOfficerSummary: async () => {
    const res = await fetch(`${API_BASE}/analytics/officer-summary`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load officer summary');
    return res.json();
  },

  getSupervisorAnalytics: async (department_id) => {
    const query = department_id ? `?department_id=${department_id}` : '';
    const res = await fetch(`${API_BASE}/analytics/supervisor${query}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load supervisor analytics');
    return res.json();
  },

  getTrends: async () => {
    const res = await fetch(`${API_BASE}/analytics/trends`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load trends');
    return res.json();
  },

  getHeatmapData: async () => {
    const res = await fetch(`${API_BASE}/analytics/heatmap`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to load heatmap data');
    return res.json();
  },

  getDepartments: async () => {
    const res = await fetch(`${API_BASE}/analytics/departments`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Voice AI Agent APIs
  getVoiceLogs: async () => {
    const res = await fetch(`${API_BASE}/voice/logs`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  submitVoiceCall: async (payload) => {
    const res = await fetch(`${API_BASE}/voice/inbound-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Voice registration failed');
    return data;
  },

  triggerOutboundCall: async (payload) => {
    const res = await fetch(`${API_BASE}/voice/trigger-outbound`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  submitOutboundResponse: async (payload) => {
    const res = await fetch(`${API_BASE}/voice/outbound-response`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Guardrails & AI Evals
  getAIEvals: async () => {
    const res = await fetch(`${API_BASE}/evals/metrics`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  testGuardrail: async (text) => {
    const res = await fetch(`${API_BASE}/evals/test-guardrail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return res.json();
  }
};
