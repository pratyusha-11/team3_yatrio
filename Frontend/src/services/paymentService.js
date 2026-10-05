const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const paymentService = {
    processPayment: async (amount, method) => {
        if (USE_MOCK) {
            await delay(1000); // simulate payment gateway
            return {
                id: `pay_${Date.now()}`,
                bookingId: 'pending',
                amount,
                method: method,
                status: 'completed',
                transactionId: `TXN${Date.now()}`,
                paidAt: new Date().toISOString()
            };
        }
        throw new Error('API not implemented');
    }
};
