/**
 * Created by cromed on 3/21/16.
 */
var pmongo = require('promised-mongo');
var _ = require('underscore');

/**
 * Create a db connection to the given db name.
 * @returns {*|exports}
 */
var getDbConnection = function () {
    return pmongo('mongodb://localhost:27017/tally');
};

var db = getDbConnection();

db.collection('commits').aggregate( [ { $group: { _id: "$author.name", commitsByAuthor: { $sum: 1 } } } ],
    function(curser) {
        console.log('curser' , curser);
        curser.toArray().forEach(function(value) {
            printjson(value);
        });
    }
);

console.log(something);

