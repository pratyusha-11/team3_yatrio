/**
 * The API's base URL — origin only, no path prefix.
 *
 * Read once, here, and imported everywhere else so there is exactly one place
 * that decides where the backend lives. There is deliberately no dev proxy in
 * vite.config.js: a proxy exists only in `vite dev`, so a production build
 * would send relative requests to the static host and 404.
 *
 * Set VITE_API_URL per environment, e.g.
 *   local      http://localhost:5000
 *   deployed   https://api.yatrio.example.com
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';
export class ApiError extends Error {
    status;
    message;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
        this.name = 'ApiError';
    }
}
async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.message || response.statusText);
    }
    const data = await response.json();
    return data.data;
}
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('auth_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}
export const apiClient = {
    async get(url, params) {
        const queryString = params ? `?${new URLSearchParams(params)}` : '';
        const response = await fetch(`${API_BASE_URL}${url}${queryString}`, {
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
    async post(url, data) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: getHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        });
        return handleResponse(response);
    },
    async put(url, data) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },
    async patch(url, data) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },
    async delete(url) {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },
};
