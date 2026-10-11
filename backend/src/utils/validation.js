/**
 * Safely extracts and validates the sortBy field against an allowlist.
 * @param {string} sortBy - The requested sort field.
 * @param {Array<string>} allowlist - Array of allowed sort fields.
 * @param {string} defaultSort - The default sort field if validation fails.
 * @returns {string} The validated sort field.
 */
const getSafeSortBy = (sortBy, allowlist, defaultSort) => {
    if (!sortBy || typeof sortBy !== 'string') return defaultSort;
    return allowlist.includes(sortBy) ? sortBy : defaultSort;
};

/**
 * Safely extracts the sortOrder, defaulting to DESC.
 * @param {string} sortOrder - The requested sort order ('ASC' or 'DESC').
 * @param {string} defaultOrder - 'ASC' or 'DESC'
 * @returns {string} The validated sort order.
 */
const getSafeSortOrder = (sortOrder, defaultOrder = 'DESC') => {
    if (!sortOrder || typeof sortOrder !== 'string') return defaultOrder;
    const order = sortOrder.toUpperCase();
    return (order === 'ASC' || order === 'DESC') ? order : defaultOrder;
};

module.exports = {
    getSafeSortBy,
    getSafeSortOrder
};
