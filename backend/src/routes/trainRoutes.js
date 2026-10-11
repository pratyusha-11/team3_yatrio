const express = require('express');
const {
  searchTrainsBetween,
  searchTrains,
  getTrainDetails,
} = require('../controllers/trainController');

const router = express.Router();

router.get('/between', searchTrainsBetween);
router.get('/search', searchTrains);
router.get('/:trainNo', getTrainDetails);

module.exports = router;
