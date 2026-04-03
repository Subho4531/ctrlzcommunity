import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API response interfaces
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    authProvider: string;
    approvalStatus?: string;
  };
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  status: 'upcoming' | 'completed';
  registrationLink?: string;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  status?: 'upcoming' | 'completed';
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  domains: string[];
  status: 'active' | 'completed' | 'archived';
  repo?: string;
  demo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFilters {
  status?: 'active' | 'completed' | 'archived';
  domain?: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  domain: string;
  year?: string;
  pfp?: string;
  github?: string;
  linkedin?: string;
  insta?: string;
  approvalStatus?: string;
  category?: 'community leads' | 'domain lead' | 'core members';
}

export interface MemberFilters {
  search?: string;
  domain?: string;
  page?: number;
  limit?: number;
}

export interface MemberListResponse {
  members: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface MemberRegistration {
  name: string;
  email: string;
  year: string;
  domain: string;
  interests?: string[];
}

export interface CommunityMember {
  id: string;
  name: string;
  email: string;
  about?: string;
  domain?: string;
  position?: string;
  city?: string;
  country?: string;
  pfp?: string;
  github?: string;
  linkedin?: string;
  insta?: string;
}

export interface CommunityLeadData {
  name: string;
  email: string;
  about?: string;
  position?: string;
  city?: string;
  country?: string;
  github?: string;
  linkedin?: string;
  insta?: string;
  pfp?: File;
}

export interface DomainLeadData {
  name: string;
  email: string;
  about?: string;
  domain?: string;
  city?: string;
  country?: string;
  github?: string;
  linkedin?: string;
  insta?: string;
  pfp?: File;
}

export interface CoreMemberData {
  name: string;
  email: string;
  about?: string;
  domain?: string;
  city?: string;
  country?: string;
  github?: string;
  linkedin?: string;
  insta?: string;
  pfp?: File;
}

// Create Axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Flag to prevent infinite token refresh loops
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  isRefreshing = false;
  failedQueue = [];
};

// Request interceptor to add token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Try to get admin token first, then fall back to auth token
    const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Check for admin token first, then auth token
      const token = localStorage.getItem('adminToken') || localStorage.getItem('authToken');
      if (!token) {
        processQueue(new Error('No token available'), null);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      return new Promise((resolve, reject) => {
        api
          .post('/api/auth/refresh', { token })
          .then(({ data }) => {
            const { token: newToken } = data;
            
            // Update appropriate token storage based on what we had
            if (localStorage.getItem('adminToken')) {
              localStorage.setItem('adminToken', newToken);
            } else {
              localStorage.setItem('authToken', newToken);
            }
            
            if (data.user) {
              localStorage.setItem('user', JSON.stringify(data.user));
            }
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
            resolve(api(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            reject(err);
          });
      });
    }

    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/login', { email, password }),

  adminLogin: (email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/admin/login', { email, password }),

  register: (email: string, password: string, name: string) =>
    api.post<AuthResponse>('/api/auth/register', { email, password, name }),

  refresh: (token: string) =>
    api.post<AuthResponse>('/api/auth/refresh', { token }),

  logout: () => api.post('/api/auth/logout'),

  getCurrentUser: () => api.get('/api/auth/me')
};

// Events endpoints
export const eventsAPI = {
  getAll: (filters?: EventFilters) =>
    api.get<Event[]>('/api/events', { params: filters }),

  getById: (id: string) => api.get<Event>(`/api/events/${id}`),

  create: (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Event>('/api/events', data),

  update: (id: string, data: Partial<Event>) =>
    api.put<Event>(`/api/events/${id}`, data),

  delete: (id: string) => api.delete(`/api/events/${id}`)
};

// Projects endpoints
export const projectsAPI = {
  getAll: (filters?: ProjectFilters) =>
    api.get<Project[]>('/api/projects', { params: filters }),

  getById: (id: string) => api.get<Project>(`/api/projects/${id}`),

  create: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Project>('/api/projects', data),

  update: (id: string, data: Partial<Project>) =>
    api.put<Project>(`/api/projects/${id}`, data),

  delete: (id: string) => api.delete(`/api/projects/${id}`)
};

// Members endpoints
export const membersAPI = {
  getAll: (filters?: MemberFilters) =>
    api.get<MemberListResponse>('/api/members', { params: filters }),

  getById: (id: string) => api.get<Member>(`/api/members/${id}`),

  register: (data: MemberRegistration) =>
    api.post<Member>('/api/members/register', data),

  create: (data: FormData) =>
    api.post<{ message: string; member: Member }>(
      '/api/members/create',
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  update: (id: string, data: FormData) =>
    api.put<{ message: string; member: Member }>(
      `/api/members/${id}`,
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  delete: (id: string) => api.delete<{ message: string }>(`/api/members/${id}`),

  // Create community members with image upload
  createCommunityLead: (data: FormData) =>
    api.post<{ message: string; member: CommunityMember }>(
      '/api/members/community/communityleads',
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  createDomainLead: (data: FormData) =>
    api.post<{ message: string; member: CommunityMember }>(
      '/api/members/community/domainleads',
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),

  createCoreMember: (data: FormData) =>
    api.post<{ message: string; member: CommunityMember }>(
      '/api/members/community/coremembers',
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
};

// Contact endpoint
export const contactAPI = {
  submit: (data: ContactData) => api.post('/api/contact', data)
};

export default api;
