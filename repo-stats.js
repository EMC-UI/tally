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
                "users": {
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
        userSummaries: userSummaries,
        projectSummaries: projectSummaries
    };

    //console.log('\n user summaries \n');
    //var total = 0;
    //_.each(summaries.userSummaries, function(summary) {
    //    console.log(summary._id, summary.count);
    //    total += summary.count;
    //    _.each(summary.projects, function(project) {
    //        console.log(project);
    //    });
    //});
    //
    //console.log('\n project summaries \n');
    //_.each(summaries.projectSummaries, function(summary) {
    //    console.log(summary._id, summary.count);
    //    total += summary.count;
    //    _.each(summary.users, function(user) {
    //        console.log(user);
    //    });
    //});

    // sample output
    //user summaries
    //
    //Brian Reynolds 12
    //dehru 5
    //Jase 5
    //klaird 5
    //mturner 3
    //Kris Thompson 2
    //sjolat2 1
    //
    //project summaries
    //
    //SKUI 31
    //{ user: 'Brian Reynolds', count: 12 }
    //{ user: 'Jase', count: 5 }
    //{ user: 'klaird', count: 5 }
    //{ user: 'dehru', count: 3 }
    //{ user: 'mturner', count: 3 }
    //{ user: 'Kris Thompson', count: 2 }
    //{ user: 'sjolat2', count: 1 }
    //CUC 2
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
