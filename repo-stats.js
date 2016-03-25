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

var updatProjectWithCommits = async (function() {
    var resultA = await (db.collection('commits').aggregate({$group: {_id: '$author.name', commitsByAuthor: { $sum: 1 }}}));
    var resultB = await (db.collection('projects').findAndModify({
        query: { key: 'BRM' },
        update: { $set: { commits: resultA} },
        new: true
    }));
    //console.log('updateResult' , resultB);
});

updatProjectWithCommits();

