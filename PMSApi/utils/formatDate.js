function getStartEndDateFromYear(currentYear) {
    if (!currentYear) {
        currentYear = new Date().getFullYear();
    }
    const startOfYear = new Date(currentYear, 0, 1); // Start date of the given year (January 1st).
    const endOfYear = new Date(currentYear + 1, 0, 1); // Start date of the next year (January 1st of the next year).
    return { startOfYear, endOfYear };
}

module.exports = {
    getStartEndDateFromYear
}