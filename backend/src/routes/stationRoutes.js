const express = require('express');
const { getStations, searchStations } = require('../controllers/stationController');

const router = express.Router();

router.get('/search', searchStations);
router.get('/', getStations);

module.exports = router;
