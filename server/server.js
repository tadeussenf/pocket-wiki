var express = require("express");
var app = express();
var request = require("request");
var bodyParser = require("body-parser");
var config = require("./config");
app.use(bodyParser.json());

app.all("/*", function (req, res) {

  // todo remove url parts not needed
  var newurl = "https://getpocket.com" + req.url.replace(config.basePath, "") + ".php"; // WTF why add .php??? Redirects are allowed!
  var headers = {
    "content-type": "application/json",
    "x-accept": "application/json",
    "accept": "application/json"
  };

  console.log(newurl);

  request({
    method: 'post',
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
  console.log("CORS proxy listening on port 1337!");
});
