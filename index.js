/**
 * Created by cromed on 3/28/16.
 */

var stats = require('./repo-stats.js');

module.exports = {
    stats: function() {
        return stats.getSummaries([7,14])
    },
    projectStats: function() {
        return stats.getProjectStats();
    }
};