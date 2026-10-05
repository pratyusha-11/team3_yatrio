const railwayService = require('../services/railway/railwayService');

/**
 * GET /stations
 * Return station master data with pagination
 */
async function getStations(req, res) {
  try {
    const { page, limit, search } = req.query;
    const result = await railwayService.getAllStations({ page, limit, search });

    return res.status(200).json({
      success: true,
      message: 'Stations retrieved successfully',
      data: result.stations,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error fetching stations:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching stations',
      },
    });
  }
}

/**
 * GET /stations/search
 * Search stations by name or code (e.g. ?q=pune)
 */
async function searchStations(req, res) {
  try {
    const { q, limit } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SEARCH_QUERY_REQUIRED',
          message: 'Query parameter "q" is required for station search',
        },
      });
    }

    const stations = await railwayService.searchStations(q, limit);

    return res.status(200).json({
      success: true,
      message: 'Matching stations retrieved successfully',
      data: stations,
    });
  } catch (error) {
    console.error('Error searching stations:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while searching stations',
      },
    });
  }
}

module.exports = {
  getStations,
  searchStations,
};
