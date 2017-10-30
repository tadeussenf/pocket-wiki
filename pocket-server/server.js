var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");
app.use(bodyParser.json());

app.all("/*", function (req, res) {

  var newurl = "https://getpocket.com" + req.url + ".php"; // WTF why add .php??? Redirects are allowed!
  var headers = {
    "content-type": "application/json",
    "x-accept": "application/json",
    "accept": "application/json"
  };

  console.log(newurl);

  request({
    url: newurl,
    headers: headers,
    body: req.body,
    json: true
  }, function (err, res, body) {
    // console.log(err);
    // console.log(res);
    // console.log(body);
  })
  .pipe(res);
});

app.listen(1337, function () {
  console.log("Example app listening on port 1337!");
});
