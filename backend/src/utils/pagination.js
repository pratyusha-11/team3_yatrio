/**
 * Calculates pagination parameters for SQL queries.
 * @param {number|string} page - The requested page number (1-indexed).
 * @param {number|string} pageSize - The requested page size.
 * @param {number} maxPageSize - The maximum allowed page size.
 * @returns {Object} { limit, offset, page, pageSize }
 */
const getPagination = (page, pageSize, maxPageSize = 100) => {
    let p = parseInt(page, 10);
    let s = parseInt(pageSize, 10);

    if (isNaN(p) || p < 1) {
        p = 1;
    }
    if (isNaN(s) || s < 1) {
        s = 20; // Default page size
    }
    if (s > maxPageSize) {
        s = maxPageSize;
    }

    const limit = s;
    const offset = (p - 1) * s;

    return { limit, offset, page: p, pageSize: s };
};

/**
 * Formats the paginated response.
 * @param {Array} data - The array of records for the current page.
 * @param {number} total - The total number of records overall.
 * @param {number} page - The current page.
 * @param {number} pageSize - The current page size.
 * @returns {Object} Formatted pagination response object.
 */
const formatPaginatedResponse = (data, total, page, pageSize) => {
    const totalPages = Math.ceil(total / pageSize);
    return {
        data,
        page,
        pageSize,
        total,
        totalPages
    };
};

module.exports = {
    getPagination,
    formatPaginatedResponse
};
