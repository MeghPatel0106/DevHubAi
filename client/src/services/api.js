import axios from 'axios';

const TOKEN_KEY = 'devhub_auth_token';

// Create Axios API instance configured for secure credentials (cookies & Bearer token)
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true, // Crucial for sending/receiving HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token header if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token expired or invalid, clear stored token
      const currentUrl = error.config?.url || '';
      if (!currentUrl.includes('/auth/login') && !currentUrl.includes('/auth/register')) {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Health Check API
 */
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

/**
 * Authentication API
 */
export const registerApi = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data?.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
  }
  return response.data;
};

export const loginApi = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data?.token) {
    localStorage.setItem(TOKEN_KEY, response.data.token);
  }
  return response.data;
};

export const logoutApi = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } finally {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getCurrentUserApi = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};


/**
 * Profile API
 */
export const getMyProfileApi = async () => {
  const response = await api.get('/profile/me');
  return response.data;
};

export const updateMyProfileApi = async (profileData) => {
  const response = await api.put('/profile/me', profileData);
  return response.data;
};

export const getPublicProfileApi = async (username) => {
  const response = await api.get(`/profile/${username}`);
  return response.data;
};

export const getPublicPortfolioApi = async (username) => {
  const response = await api.get(`/profile/public/${username}`);
  return response.data;
};

/**
 * Projects API
 */
export const getProjectsApi = async () => {
  const response = await api.get('/projects');
  return response.data;
};

export const getProjectByIdApi = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

export const createProjectApi = async (projectData) => {
  const response = await api.post('/projects', projectData);
  return response.data;
};

export const updateProjectApi = async (id, projectData) => {
  const response = await api.put(`/projects/${id}`, projectData);
  return response.data;
};

export const deleteProjectApi = async (id) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
};

/**
 * Resumes API
 */
export const getResumesApi = async () => {
  const response = await api.get('/resumes');
  return response.data;
};

export const getResumeByIdApi = async (id) => {
  const response = await api.get(`/resumes/${id}`);
  return response.data;
};

export const createResumeApi = async (resumeData) => {
  const response = await api.post('/resumes', resumeData);
  return response.data;
};

export const updateResumeApi = async (id, resumeData) => {
  const response = await api.put(`/resumes/${id}`, resumeData);
  return response.data;
};

export const setDefaultResumeApi = async (id) => {
  const response = await api.patch(`/resumes/${id}/default`);
  return response.data;
};

export const deleteResumeApi = async (id) => {
  const response = await api.delete(`/resumes/${id}`);
  return response.data;
};

/**
 * Certificates API
 */
export const getCertificatesApi = async () => {
  const response = await api.get('/certificates');
  return response.data;
};

export const getCertificateByIdApi = async (id) => {
  const response = await api.get(`/certificates/${id}`);
  return response.data;
};

export const createCertificateApi = async (certData) => {
  const response = await api.post('/certificates', certData);
  return response.data;
};

export const updateCertificateApi = async (id, certData) => {
  const response = await api.put(`/certificates/${id}`, certData);
  return response.data;
};

export const deleteCertificateApi = async (id) => {
  const response = await api.delete(`/certificates/${id}`);
  return response.data;
};

/**
 * Job Applications API
 */
export const getJobApplicationsApi = async (params = {}) => {
  let query = '';
  if (typeof params === 'string') {
    query = params ? `?status=${encodeURIComponent(params)}` : '';
  } else if (typeof params === 'object' && params !== null) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'All') {
        searchParams.append(key, val);
      }
    });
    const str = searchParams.toString();
    query = str ? `?${str}` : '';
  }
  const response = await api.get(`/job-applications${query}`);
  return response.data;
};

export const getJobApplicationByIdApi = async (id) => {
  const response = await api.get(`/job-applications/${id}`);
  return response.data;
};

export const createJobApplicationApi = async (appData) => {
  const response = await api.post('/job-applications', appData);
  return response.data;
};

export const updateJobApplicationApi = async (id, appData) => {
  const response = await api.put(`/job-applications/${id}`, appData);
  return response.data;
};

export const updateJobApplicationStatusApi = async (id, status) => {
  const response = await api.patch(`/job-applications/${id}/status`, { status });
  return response.data;
};

export const deleteJobApplicationApi = async (id) => {
  const response = await api.delete(`/job-applications/${id}`);
  return response.data;
};

/**
 * Skills API
 */
export const getSkillsApi = async () => {
  const response = await api.get('/skills');
  return response.data;
};

export const createSkillApi = async (skillData) => {
  const response = await api.post('/skills', skillData);
  return response.data;
};

export const updateSkillApi = async (id, skillData) => {
  const response = await api.put(`/skills/${id}`, skillData);
  return response.data;
};

export const deleteSkillApi = async (id) => {
  const response = await api.delete(`/skills/${id}`);
  return response.data;
};

/**
 * GitHub Analytics API
 */
export const getGitHubAnalyticsApi = async () => {
  const response = await api.get('/github/analytics');
  return response.data;
};

export const connectGitHubApi = async (username, showOnPortfolio = true) => {
  const response = await api.post('/github/connect', { username, showOnPortfolio });
  return response.data;
};

export const refreshGitHubApi = async () => {
  const response = await api.post('/github/sync');
  return response.data;
};

export const updateGitHubVisibilityApi = async (showOnPortfolio) => {
  const response = await api.patch('/github/visibility', { showOnPortfolio });
  return response.data;
};

export const disconnectGitHubApi = async () => {
  const response = await api.delete('/github/disconnect');
  return response.data;
};

/**
 * AI Career Advisor & Intelligent Profile Analysis API
 */
export const getCareerGoalsApi = async () => {
  const response = await api.get('/ai/goals');
  return response.data;
};

export const updateCareerGoalsApi = async (goals) => {
  const response = await api.put('/ai/goals', goals);
  return response.data;
};

export const getLatestAIAnalysisApi = async () => {
  const response = await api.get('/ai/latest-analysis');
  return response.data;
};

export const runAIProfileAnalysisApi = async (payload) => {
  const response = await api.post('/ai/analyze-profile', payload);
  return response.data;
};

export const askAICareerQuestionApi = async (question) => {
  const response = await api.post('/ai/career-question', { question });
  return response.data;
};

/**
 * Recruiter & Candidate Discovery API
 */
export const getRecruiterDashboardStatsApi = async () => {
  const response = await api.get('/recruiter/dashboard');
  return response.data;
};

export const getRecruiterProfileApi = async () => {
  const response = await api.get('/recruiter/profile');
  return response.data;
};

export const updateRecruiterProfileApi = async (profileData) => {
  const response = await api.put('/recruiter/profile', profileData);
  return response.data;
};

export const findCandidatesApi = async (params = {}) => {
  const response = await api.get('/recruiter/candidates', { params });
  return response.data;
};

export const getCandidateDetailsApi = async (id) => {
  const response = await api.get(`/recruiter/candidates/${id}`);
  return response.data;
};

export const getShortlistsApi = async () => {
  const response = await api.get('/recruiter/shortlists');
  return response.data;
};

export const addToShortlistApi = async (developerId) => {
  const response = await api.post(`/recruiter/shortlists/${developerId}`);
  return response.data;
};

export const removeFromShortlistApi = async (developerId) => {
  const response = await api.delete(`/recruiter/shortlists/${developerId}`);
  return response.data;
};

export const getCandidateNotesApi = async (developerId) => {
  const response = await api.get(`/recruiter/candidates/${developerId}/notes`);
  return response.data;
};

export const createCandidateNoteApi = async (developerId, data) => {
  const response = await api.post(`/recruiter/candidates/${developerId}/notes`, data);
  return response.data;
};

export const updateCandidateNoteApi = async (noteId, data) => {
  const response = await api.put(`/recruiter/notes/${noteId}`, data);
  return response.data;
};

export const deleteCandidateNoteApi = async (noteId) => {
  const response = await api.delete(`/recruiter/notes/${noteId}`);
  return response.data;
};

export default api;
