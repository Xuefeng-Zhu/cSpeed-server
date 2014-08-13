var Firebase = require('firebase');

var fb = new Firebase('https://speedtest.firebaseio.com/');

fb.child('individuals').on("value", function(dataSnapshot) {
    console.log(dataSnapshot.name())
});;