var Firebase = require('firebase');
var fb = new Firebase('https://speedtest.firebaseio.com/');
var total = {
    count: 0
};

fb.child('individuals').on("value", function(dataSnapshot) {
    var data = dataSnapshot.val();
    for (var i in data) {
        var test = data[i]
        if (total.median) {
            total.median.push(0);
        } else {
            total.median = [0];
        }
        for (var site in test) {
            if (site != "user_info") {
                var time = test[site].time
                var load_time = time.loadEventEnd - time.navigationStart;
                if (total[site]) {
                    total[site].push(load_time);
                } else {
                    total[site] = [load_time];
                }
                total.median[total.count] += load_time;
            }
        }
        total.count += 1;
    }
    fb.child('test').set(total);
});;