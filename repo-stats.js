/**
 * Created by cromed on 3/21/16.
 */
var pmongo = require('promised-mongo');
var _ = require('underscore');
var await = require('asyncawait/await');
var async = require('asyncawait/async');
var moment = require('moment');

var DEFAULT_SINCE_DAYS = 7;

/**
 * Create a db connection to the given db name.
 * @returns {*|exports}
 */
var getDbConnection = function () {
    return pmongo('mongodb://localhost:27017/tally');
};

var sinceTime = function (sinceDays) {
    sinceDays = sinceDays || DEFAULT_SINCE_DAYS;
    return moment().subtract(sinceDays, 'd').valueOf();
};

var db = getDbConnection();

var totalCount = function (sinceDays) {
    var since = sinceTime(sinceDays);
    return db.collection('commits').find({'authorTimestamp': {'$gte': since}}).count();
};

var projectStats = function (sinceDays) {
    var since = sinceTime(sinceDays);
    return db.collection('commits').aggregate(
        {
            '$match': {'authorTimestamp': {$gte: since}}
        },
        {
            "$group": {
                "_id": {
                    "project": "$project.key",
                    "user": "$author.name"
                },
                "commitsByProjectAuthor": {"$sum": 1}
            }
        },
        {
            "$sort": {"commitsByProjectAuthor": -1}
        },
        {
            "$group": {
                "_id": "$_id.project",
                "users": {
                    "$push": {
                        "user": "$_id.user",
                        "count": "$commitsByProjectAuthor"
                    }
                },
                "count": {"$sum": "$commitsByProjectAuthor"}
            }
        },
        {
            "$sort": {"count": -1}
        }
    );
};

var userStats = function (sinceDays) {
    var since = sinceTime(sinceDays);
    return db.collection('commits').aggregate(
        {
            '$match': {'authorTimestamp': {$gte: since}}
        },
        {
            "$group": {
                "_id": {
                    "user": "$author.name",
                    "project": "$project.key"
                },
                "commitsByAuthorProject": {"$sum": 1}
            }
        },
        {
            "$sort": {"commitsByAuthorProject": -1}
        },
        {
            "$group": {
                "_id": "$_id.user",
                "projects": {
                    "$push": {
                        "project": "$_id.project",
                        "count": "$commitsByAuthorProject"
                    }
                },
                "count": {"$sum": "$commitsByAuthorProject"}
            }
        },
        {
            "$sort": {"count": -1}
        }
    );
};

var getUserStats = async(function (sinceDays) {
    var total = await(totalCount(sinceDays));
    var stats = await(userStats(sinceDays));
    return {
        since: sinceDays,
        totalCount: total,
        stats: stats
    };
});

var getProjectStats = async(function (sinceDays) {
    var total = await(totalCount(sinceDays));
    var stats = await(projectStats(sinceDays));
    return {
        since: sinceDays,
        totalCount: total,
        stats: stats
    };
});

var getStats = async(function (sinceDays) {
    var total = await(totalCount(sinceDays));
    var projects = await(projectStats(sinceDays));
    var users = await(userStats(sinceDays));
    var stats = {
        since: sinceDays,
        totalCount: total,
        projectStats: projects,
        userStats: users
    };
    return stats;
});

var getStatsMultiDays = async(function (sinceDaysMulti) {
    var results = [];
    _.each(sinceDaysMulti, function (sinceDays) {
        results.push(await(getStats(sinceDays)));
    });
    return results;
});

module.exports = {
    getUserStats: getUserStats,
    getProjectStats: getProjectStats,
    getStats: getStats,
    getStatsMultiDays: getStatsMultiDays
};
