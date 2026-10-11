import { auditLogs } from '@/data/auditLogs';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const auditService = {
    getAuditLogs: async () => {
        if (USE_MOCK) {
            await delay(500);
            return auditLogs;
        }
        throw new Error('API not implemented');
    }
};
