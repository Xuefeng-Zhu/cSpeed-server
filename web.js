var Firebase = require('firebase');
var express = require("express");
var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGenerator = new FirebaseTokenGenerator(process.env.FIREBASE);
var token = tokenGenerator.createToken({uid: "1", some: "arbitrary", data: "here"});

var fb = new Firebase('https://speedtest.firebaseio.com/');
fb.authWithCustomToken(token, function(error, authData) {
  if (error) {
    console.log("Login Failed!", error);
  } else {
    console.log("Login Succeeded!", authData);
  }
});

var app = express();

var total = {
    count: 0,
    perf: 0
};

var region = {

};

fb.child('individuals').on("child_added", function(dataSnapshot) {
    var test = dataSnapshot.val();
    var ip = test.user_info.ip;
    if (ip == undefined){
        return;
    }

    var location = [ip.city, ip.region, ip.country].join('_');
    if (total.median) {
        total.median.push(0);
    } else {
        total.median = [0];
    }

    if (region[location]) {
        region[location].median.push(0);
    } else {
        region[location] = {
            median: [0],
            count: 0
        };
    }

    if (region[location][ip.isp]) {
        region[location][ip.isp].median.push(0);
    } else {
        region[location][ip.isp] = {
            median: [0],
            count: 0
        };
    }

    for (var site in test) {
        if (site != "user_info") {
            var time = test[site].time
            var load_time = time.loadEventEnd - time.navigationStart;

            //load data into total 
            if (total[site]) {
                total[site] += load_time;
            } else {
                total[site] = load_time;
            }
            total.median[total.count] += load_time;

            //load data into region
            var temp = region[location];
            temp.median[temp.count] += load_time;
            temp = region[location][ip.isp];
            temp.median[temp.count] += load_time;
        }
    }
    total.perf += test.user_info.performance;

    total.count += 1;
    region[location].count += 1;
    region[location][ip.isp].count += 1;

    //find median value for total
    total['median'].sort(function(a,b){return a - b});
    fb.child(['total', 'median'].join('/')).set(total['median'][Math.floor(total['median'].length / 2)]);
    for (var i in total) {
        if (i != "count" && i != 'median') {
            fb.child(['total', i].join('/')).set(total[i] / total['count']);
        }
    }
    fb.child('total/count').set(total.count);

    //find median for region
    for (var i in region) {
        var city = region[i];
        for (var isp in city) {
            if (isp != "count" && isp != "median") {
                city[isp].median.sort(function(a,b){return a - b});
                fb.child(['region', i, isp.replace(/\./g, '-'), 'median'].join('/')).set(city[isp].median[Math.floor(city[isp].count / 2)]);
                fb.child(['region', i, isp.replace(/\./g, '-'), 'count'].join('/')).set(city[isp].count);
            }
        }
        city.median.sort(function(a,b){return a - b});
        fb.child(['region', i, 'median'].join('/')).set(city.median[Math.floor(city.count / 2)]);
        fb.child(['region', i, 'count'].join('/')).set(city.count);
    }

});

app.get('/', function (req, res) {
  res.send('Hello World!')
});

var port = Number(process.env.PORT || 7000);
app.listen(port, function() {
    console.log("Listening on " + port);
});
