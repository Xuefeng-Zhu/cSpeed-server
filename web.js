var Firebase = require('firebase');

var fb = new Firebase('https://speedtest.firebaseio.com/');
var app = express();

fb.child('individuals').on("value", function(dataSnapshot) {
    console.log(dataSnapshot.name())
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});
