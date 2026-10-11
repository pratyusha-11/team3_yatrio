import authFetch from '@/utils/authFetch';
import { API_BASE_URL as BASE_URL } from '@/api/client';

const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.error?.message || data?.message || 'API request failed');
    }
    return data;
};

export const adminService = {
    getDashboard: async (params) => {
        const queryParams = new URLSearchParams(params).toString();
        const res = await authFetch(`${BASE_URL}/admin/dashboard?${queryParams}`);
        return handleResponse(res);
    },

    getUsers: async (params) => {
        const queryParams = new URLSearchParams(params).toString();
        const res = await authFetch(`${BASE_URL}/admin/users?${queryParams}`);
        return handleResponse(res);
    },

    getTrains: async (params) => {
        const queryParams = new URLSearchParams(params).toString();
        const res = await authFetch(`${BASE_URL}/admin/trains?${queryParams}`);
        return handleResponse(res);
    },

    getBookings: async (params) => {
        const queryParams = new URLSearchParams(params).toString();
        const res = await authFetch(`${BASE_URL}/admin/bookings?${queryParams}`);
        return handleResponse(res);
    },

    getPayments: async (params) => {
        const queryParams = new URLSearchParams(params).toString();
        const res = await authFetch(`${BASE_URL}/admin/payments?${queryParams}`);
        return handleResponse(res);
    },

    getCancellations: async (params) => {
        const queryParams = new URLSearchParams(params).toString();
        const res = await authFetch(`${BASE_URL}/admin/cancellations?${queryParams}`);
        return handleResponse(res);
    },

    getAuditLogs: async (params) => {
        const queryParams = new URLSearchParams(params).toString();
        const res = await authFetch(`${BASE_URL}/admin/audit-logs?${queryParams}`);
        return handleResponse(res);
    },

    getReports: async (params) => {
        const queryParams = new URLSearchParams(params).toString();
        const res = await authFetch(`${BASE_URL}/admin/reports?${queryParams}`);
        return handleResponse(res);
    },

    getAnalytics: async (params) => {
        const queryParams = new URLSearchParams(params).toString();
        const res = await authFetch(`${BASE_URL}/admin/analytics?${queryParams}`);
        return handleResponse(res);
    },

    getMonitoringSystem: async () => {
        const res = await authFetch(`${BASE_URL}/admin/monitoring`);
        return handleResponse(res);
    },

    getMonitoringApi: async (params) => {
        const queryParams = new URLSearchParams(params).toString();
        const res = await authFetch(`${BASE_URL}/admin/monitoring/api?${queryParams}`);
        return handleResponse(res);
    },
    
    getMonitoringPnr: async () => {
        const res = await authFetch(`${BASE_URL}/admin/monitoring/pnr`);
        return handleResponse(res);
    }
};
