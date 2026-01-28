const STORAGE_KEY = 'birth_chart_history';

/**
 * Retrieves the birth chart history from local storage.
 * @returns {Array} List of history entries.
 */
function getHistory() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * Saves a new entry to the birth chart history.
 * @param {Object} entry The history entry to save.
 */
function saveToHistory(entry) {
    let history = getHistory();
    // Remove duplicate
    history = history.filter(h =>
        !(h.date === entry.date && h.time === entry.time &&
            h.lon === entry.lon && h.lat === entry.lat)
    );
    history.unshift(entry);
    history = history.slice(0, 10); // Keep last 10
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    // Trigger UI update if function exists
    if (typeof renderHistory === 'function') {
        renderHistory();
    }
}
