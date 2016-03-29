/**
 * Created by klaird on 3/28/16.
 */

var stats = require('./repo-stats');
var tally = require('./tally');

module.exports = {
    /**
     * Get user stats.
     * @param sinceDays e.g. 7 means since 7 days ago
     * @return e.g.
     * {
     *      since: 14,
     *      totalCount: 147,
     *      stats: [
     *          {
     *              _id: 'dehru',
     *              projects: [
     *                  { project: 'SKUI', count: 44 },
     *                  { project: 'CUC', count: 10 },
     *                  { project: 'CSC', count: 4 }
     *              ],
     *              count: 58
     *          },
     *          {
     *              _id: 'Brian Reynolds',
     *              projects: [
     *                  { project: 'SKUI', count: 15 }
     *              ],
     *              count: 15
     *          }
     *      ]
     * }
     */
    userStats: function(sinceDays) {
        return stats.getUserStats(sinceDays);
    },

    /**
     * Get project stats.
     * @param sinceDays e.g. 7 means since 7 days ago
     * @return e.g.
     * {
     *      since: 14,
     *      totalCount: 147,
     *      stats: [
     *          {
     *              _id: 'SKUI',
     *              users: [
     *                  { user: 'dehru', count: 44 },
     *                  { user: 'Brian Reynolds', count: 15 }
     *              ],
     *              count: 132
     *          },
     *          {
     *              _id: 'CUC',
     *              users: [
     *                  { user: 'dehru', count: 10 },
     *                  { user: 'klaird', count: 1 }
     *              ],
     *              count: 11
     *          }
     *      ]
     * }
     */
    projectStats: function(sinceDays) {
        return stats.getProjectStats(sinceDays);
    },

    /**
     * Get user and project stats.
     * @param sinceDays e.g. 7 means since 7 days ago
     * @result e.g.
     * {
     *      since: 14,
     *      totalCount: 147,
     *      projectStats: [
     *          { _id: 'SKUI', users: [Object], count: 132 },
     *          { _id: 'CUC', users: [Object], count: 11 }
     *      ],
     *      userStats: [
     *          { _id: 'dehru', projects: [Object], count: 58 },
     *          { _id: 'Brian Reynolds', projects: [Object], count: 15 }
     *      ]
     * }
     */
    stats: function(sinceDays) {
        return stats.getStats(sinceDays);
    },

    /**
     * Get user and project stats with an array of days.
     * @param sinceDaysMulti e.g. [7,14] for last 7 or 14 days
     */
    statsMultiDays: function(sinceDaysMulti) {
        return stats.getStatsMultiDays(sinceDaysMulti);
    },

    /**
     * Insert data in mongo db. It is usually run by a backend process periodically.
     * @param sinceDays e.g. 7 means since 7 days ago
     */
    createData: function(sinceDays) {
        tally.createData(sinceDays);
    }
};
