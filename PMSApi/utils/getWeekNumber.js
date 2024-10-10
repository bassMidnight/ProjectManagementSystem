function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// console.log(getWeekStartAndEnd(41, 2024));
function getWeekStartAndEnd(weekNumber, year) {
    const firstDayOfYear = new Date(year, 0, 1);
    const firstDayOfWeek = firstDayOfYear.getDay();
    const daysToFirstMonday = (firstDayOfWeek <= 4 ? firstDayOfWeek - 1 : 6 - (7 - firstDayOfWeek));
    const firstMonday = new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() - daysToFirstMonday));
    const weekStartDate = new Date(firstMonday.setDate(firstMonday.getDate() + (weekNumber - 1) * 7));
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);

    return {
        startDate: `${weekStartDate.getDate().toString().padStart(2, '0')}-${(weekStartDate.getMonth() + 1).toString().padStart(2, '0')}-${weekStartDate.getFullYear()}`,
        endDate: `${weekEndDate.getDate().toString().padStart(2, '0')}-${(weekEndDate.getMonth() + 1).toString().padStart(2, '0')}-${weekEndDate.getFullYear()}`,
    };
}

module.exports = {
    getWeekNumber,
    getWeekStartAndEnd
}