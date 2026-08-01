/**
 * Calculates the daily post limit based on the user's friend count.
 * 
 * @param {number} friendCount - The number of friends the user has.
 * @returns {number} The maximum number of posts allowed per day (Infinity means unlimited).
 */
function getDailyPostLimit(friendCount) {
    if (typeof friendCount !== 'number' || friendCount < 0) {
        return 0;
    }
    
    if (friendCount === 0) return 0;
    if (friendCount === 1) return 1;
    if (friendCount === 2) return 2;
    if (friendCount >= 3 && friendCount <= 10) return friendCount;
    
    // More than 10 friends -> unlimited posts
    return Infinity;
}

module.exports = {
    getDailyPostLimit
};
