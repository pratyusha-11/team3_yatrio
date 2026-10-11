/**
 * Railway API Adapter
 * Layer that connects to external Railway APIs (e.g. IRCTC, RapidAPI, Indian Rail API)
 * with timeout handling, normalization, and fallback to local DB.
 */
class RailwayApiAdapter {
  constructor() {
    this.baseUrl = process.env.RAILWAY_API_BASE_URL || '';
    this.apiKey = process.env.RAILWAY_API_KEY || '';
    this.timeoutMs = parseInt(process.env.RAILWAY_API_TIMEOUT_MS, 10) || 5000;
  }

  isConfigured() {
    return Boolean(this.baseUrl && this.apiKey);
  }

  /**
   * Internal fetch with timeout
   */
  async _fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': this.apiKey,
          'Authorization': `Bearer ${this.apiKey}`,
          ...(options.headers || {})
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        const timeoutError = new Error(`Railway API request timed out after ${this.timeoutMs}ms`);
        timeoutError.code = 'EXTERNAL_API_TIMEOUT';
        throw timeoutError;
      }
      const connError = new Error(`Railway API unavailable: ${err.message}`);
      connError.code = 'EXTERNAL_API_UNAVAILABLE';
      throw connError;
    }
  }

  /**
   * Fetch live train status or schedule from external API if configured
   */
  async fetchLiveTrainSchedule(trainNo) {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const url = `${this.baseUrl}/trains/${encodeURIComponent(trainNo)}/schedule`;
      const response = await this._fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`External Railway API returned HTTP ${response.status}`);
      }

      const rawData = await response.json();
      return this._normalizeTrainSchedule(rawData);
    } catch (error) {
      console.warn(`[RailwayApiAdapter] Failed to fetch external schedule for train ${trainNo}:`, error.message);
      return null;
    }
  }

  /**
   * Normalize external API train schedule into Yatrio format
   */
  _normalizeTrainSchedule(raw) {
    if (!raw) return null;
    return {
      trainNumber: String(raw.train_num || raw.trainNumber || raw.train_number),
      trainName: raw.train_name || raw.trainName || '',
      stops: (raw.route || raw.stops || []).map((s, idx) => ({
        sequence: s.seq || idx + 1,
        stationCode: s.station_code || s.code,
        stationName: s.station_name || s.name,
        arrivalTime: s.arr || s.arrival_time,
        departureTime: s.dep || s.departure_time,
        distanceKm: s.distance || s.distance_km || 0,
        dayOffset: s.day || s.day_offset || 1
      }))
    };
  }
}

module.exports = new RailwayApiAdapter();
