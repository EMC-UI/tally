/**
 * Created by klaird on 3/28/16.
 */

var tally = require('./index');
var _ = require('underscore');

var testUserStats = function(sinceDays) {
    tally.userStats(sinceDays).then(function(result) {
        console.log('\n\n****** testUserStats', result);
    });
};

var testProjectStats = function(sinceDays) {
    tally.projectStats(sinceDays).then(function(result) {
        console.log('\n\n****** testProjectStats', result);
    });
};

var testRepoStats = function(sinceDays) {
    tally.repoStats(sinceDays).then(function(result) {
        console.log('\n\n****** testRepoStats', result);
    });
};

var testStats = function(sinceDays) {
    tally.stats(sinceDays).then(function(result) {
        console.log('\n\n****** testStats', result);
        //console.log('\n userStats \n');
        //_.each(result.userStats, function(summary) {
        //    console.log(summary._id, 'count=', summary.count);
        //    _.each(summary.projects, function(project) {
        //        console.log(project);
        //    });
        //});
        //
        //console.log('\n projectStats \n');
        //_.each(result.projectStats, function(summary) {
        //    console.log(summary._id, 'count=', summary.count);
        //    _.each(summary.users, function(user) {
        //        console.log(user);
        //    });
        //});
    });
};

var testCreateData = function(sinceDays) {
    tally.createData(sinceDays);
};
//testCreateData(14);

var tests = function(sinceDays) {
    testUserStats(sinceDays);
    testProjectStats(sinceDays);
    testRepoStats(sinceDays);
    testStats(sinceDays);
};

tests(7);