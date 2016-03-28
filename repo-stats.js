/**
 * Created by cromed on 3/21/16.
 */
var pmongo = require('promised-mongo');
var _ = require('underscore');
var await = require('asyncawait/await');
var async = require('asyncawait/async');

/**
 * Create a db connection to the given db name.
 * @returns {*|exports}
 */
var getDbConnection = function () {
    return pmongo('mongodb://localhost:27017/tally');
};

var db = getDbConnection();

var getSummaries = async(function () {
    var totalCount = await(db.collection('commits').count());

    var userSummaries = await(db.collection('commits').aggregate(
        {
            "$group": {
                "_id": {
                    "user": "$author.name",
                    "project": "$project.key"
                },
                "commitsByAuthorProject": {"$sum": 1}
            }
        },
        {"$sort": {"commitsByAuthorProject": -1}},
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
        {"$sort": {"count": -1}}
    ));

    var projectSummaries = await(db.collection('commits').aggregate(
        {
            "$group": {
                "_id": {
                    "project": "$project.key",
                    "user": "$author.name"
                },
                "commitsByProjectAuthor": {"$sum": 1}
            }
        },
        {"$sort": {"commitsByProjectAuthor": -1}},
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
        {"$sort": {"count": -1}}
    ));

    var summaries = {
        totalCount: totalCount,
        userSummaries: userSummaries,
        projectSummaries: projectSummaries
    };

    //console.log('\n totalCount', totalCount);
    //
    //console.log('\n user summaries \n');
    //_.each(summaries.userSummaries, function(summary) {
    //    console.log(summary._id, 'count=', summary.count);
    //    _.each(summary.projects, function(project) {
    //        console.log(project);
    //    });
    //});
    //
    //console.log('\n project summaries \n');
    //_.each(summaries.projectSummaries, function(summary) {
    //    console.log(summary._id, 'count=', summary.count);
    //    _.each(summary.users, function(user) {
    //        console.log(user);
    //    });
    //});

    // sample output
    //
    //totalCount 33
    //
    //user summaries
    //
    //Brian Reynolds count= 12
    //{ project: 'SKUI', count: 12 }
    //dehru count= 5
    //{ project: 'SKUI', count: 3 }
    //{ project: 'CUC', count: 2 }
    //Jase count= 5
    //{ project: 'SKUI', count: 5 }
    //klaird count= 5
    //{ project: 'SKUI', count: 5 }
    //mturner count= 3
    //{ project: 'SKUI', count: 3 }
    //Kris Thompson count= 2
    //{ project: 'SKUI', count: 2 }
    //sjolat2 count= 1
    //{ project: 'SKUI', count: 1 }
    //
    //project summaries
    //
    //SKUI count= 31
    //{ user: 'Brian Reynolds', count: 12 }
    //{ user: 'Jase', count: 5 }
    //{ user: 'klaird', count: 5 }
    //{ user: 'dehru', count: 3 }
    //{ user: 'mturner', count: 3 }
    //{ user: 'Kris Thompson', count: 2 }
    //{ user: 'sjolat2', count: 1 }
    //CUC count= 2
    //{ user: 'dehru', count: 2 }

    return summaries;
});

//var updateProjectWithCommits = async(function () {
    //var userSummary = await(db.collection('commits').aggregate({
    //    $group: {
    //        _id: '$author.name',
    //        commitsByAuthor: {$sum: 1}
    //    }
    //}));
    //console.log('userSummary', userSummary);
    //
    //var projectSummary = await(db.collection('commits').aggregate({
    //    $group: {
    //        _id: '$project.key',
    //        commitsByProject: {$sum: 1}
    //    }
    //}));
    //console.log('\n\nprojectSummary\n', projectSummary);
//});


getSummaries();
