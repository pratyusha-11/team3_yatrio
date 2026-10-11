const railwayService = require('../services/railway/railwayService');
const {
  validateJourneyDate,
  validateStationPair,
} = require('../validators/railwayValidators');

/**
 * GET /trains/between
 * Search trains between source station, destination station, and journey date
 * e.g. GET /trains/between?from=PUNE&to=MMCT&date=2026-10-15
 */
async function searchTrainsBetween(req, res) {
  try {
    const { from, to, date } = req.query;

    // 1. Validate date
    const dateValidation = validateJourneyDate(date);
    if (!dateValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: dateValidation.code,
          message: dateValidation.message,
        },
      });
    }

    // 2. Validate station pair
    const stationValidation = await validateStationPair(from, to);
    if (!stationValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: stationValidation.code,
          message: stationValidation.message,
        },
      });
    }

    // 3. Search trains
    const result = await railwayService.searchTrainsBetween({
      fromCode: from,
      toCode: to,
      journeyDate: date,
    });

    return res.status(200).json({
      success: true,
      message: `${result.total} trains found between ${from.toUpperCase()} and ${to.toUpperCase()}`,
      data: result,
    });
  } catch (error) {
    console.error('Error searching trains between stations:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while searching trains',
      },
    });
  }
}

/**
 * GET /trains/search
 * Search trains by number or name
 */
async function searchTrains(req, res) {
  try {
    const { q, type, page, limit } = req.query;
    const trains = await railwayService.searchTrains({ query: q, type, page, limit });

    return res.status(200).json({
      success: true,
      message: 'Trains search completed successfully',
      data: trains,
    });
  } catch (error) {
    console.error('Error searching trains:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while searching trains',
      },
    });
  }
}

/**
 * GET /trains/:trainNo
 * Return details for a specific train
 */
async function getTrainDetails(req, res) {
  try {
    const { trainNo } = req.params;

    if (!trainNo || !trainNo.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TRAIN_NUMBER_REQUIRED',
          message: 'Train number is required',
        },
      });
    }

    const train = await railwayService.getTrainDetails(trainNo);

    if (!train) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TRAIN_NOT_FOUND',
          message: `Train with number "${trainNo}" was not found`,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Train details retrieved successfully',
      data: train,
    });
  } catch (error) {
    console.error(`Error fetching train details for ${req.params.trainNo}:`, error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching train details',
      },
    });
  }
}

module.exports = {
  searchTrainsBetween,
  searchTrains,
  getTrainDetails,
};
