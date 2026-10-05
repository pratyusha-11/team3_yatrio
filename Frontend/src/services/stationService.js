import { stations } from '@/data/stations';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const stationService = {
  getAllStations: async () => {
    if (USE_MOCK) {
      await delay(300);
      return stations;
    }
    throw new Error('API not implemented');
  },

  getStationById: async (id) => {
    if (USE_MOCK) {
      await delay(200);
      return stations.find((s) => s.id === id);
    }
    throw new Error('API not implemented');
  }
};
