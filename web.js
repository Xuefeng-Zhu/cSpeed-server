var Firebase = require('firebase');
var express = require("express");

var fb = new Firebase('https://speedtest.firebaseio.com/');
var app = express();

var total = {
    count: 0
};

var region = {

};

fb.child('individuals').on("value", function(dataSnapshot) {
    var data = dataSnapshot.val();
    for (var i in data) {
        var test = data[i];
        var ip = test.user_info.ip;

        if (total.median) {
            total.median.push(0);
        } else {
            total.median = [0];
        }

        if (region[ip.city] == undefined) {
            region[ip.city] = {
                count: 0
            };
        }

        if (region[ip.city][ip.isp] == undefined) {
            region[ip.city][ip.isp] = {
                median: [0],
                count: 0
            };
        } else {
            region[ip.city][ip.isp].median.push(0);
        }

        for (var site in test) {
            if (site != "user_info") {
                var time = test[site].time
                var load_time = time.loadEventEnd - time.navigationStart;

                //load data into total 
                if (total[site]) {
                    total[site].push(load_time);
                } else {
                    total[site] = [load_time];
                }
                total.median[total.count] += load_time;

                //load data into region
                var temp = region[ip.city][ip.isp];
                temp.median[temp.count] += load_time;
            }
        }
        total.count += 1;
        region[ip.city].count += 1;
        region[ip.city][ip.isp].count += 1;
    }
    //find median value for total
    for (var i in total) {
        if (i != "count") {
            total[i].sort();
            fb.child(['total',i].join('/')).set(total[i][Math.floor(total[i].length / 2)]);
        }
    }
    fb.child('total/child').set(total.count);

    //find median for region
    for (var i in region) {
        var city = region[i];
        for (var isp in city) {
            if (isp != "count") {
                city[isp].median.sort();
                fb.child(['region', i, isp, 'median'].join('/')).set(city[isp].median[Math.floor(city[isp].count / 2)]);
            }
        }
        fb.child(['region', i, 'count'].join('/')).set(city.count);
        fb.child(['region', i, isp, 'count'].join('/')).set(city[isp].count);
    }

});

var port = Number(process.env.PORT || 7000);
app.listen(port, function() {
    console.log("Listening on " + port);
});