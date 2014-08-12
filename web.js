// web.js
var express = require("express");
var logfmt = require("logfmt");

var Firebase = require('firebase');
var fb = new Firebase('https://speedtest.firebaseio.com/');
var fbvalue = null;
fb.child('individuals').on("value", function(dataSnapshot) {
	fbvalue = dataSnapshot.val();
});;

var app = express();

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send(fbvalue);
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
