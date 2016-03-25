/**
 * Created by cromed on 3/25/16.
 */
conn = new Mongo();
db = conn.getDB("tally");
print(db.commits.count());

var curser = db.commits.aggregate( [ { $group: { _id: "$author.name", commitsByAuthor: { $sum: 1 } } } ] );
curser.toArray().forEach(function(value) {
    printjson(value);
});

//db.commits.aggregate(
//    [
//        {
//            $group : {
//                _id : { author: { $month: "$date" }, day: { $dayOfMonth: "$date" }, year: { $year: "$date" } },
//                totalPrice: { $sum: { $multiply: [ "$price", "$quantity" ] } },
//                averageQuantity: { $avg: "$quantity" },
//                count: { $sum: 1 }
//            }
//        }
//    ]
//)