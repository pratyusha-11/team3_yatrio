const morgan = require('morgan');

// Standard API request logging middleware using morgan
// Format: :method :url :status :res[content-length] - :response-time ms
const requestLogger = morgan('dev');

module.exports = requestLogger;
