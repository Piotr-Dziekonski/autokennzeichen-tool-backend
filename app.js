var express = require("express");
const req = require("express/lib/request");
var bodyParser = require("body-parser")
var app = express();
var connection = require('./database');

app.use(bodyParser.json());

app.get('/', function (req, res) {
   let sql = "SELECT * FROM kennzeichnung";
   connection.query(sql, function (err, results, fields) {
      if (err) throw err;
      res.send(results);
   });
});

app.post("/import", function (req, res) {
   let jsondata = req.body
   console.log(req.body)
   let values = []
   for (var i = 0; i < Object.keys(jsondata).length; i++) {
      values.push([jsondata[i].Ortskuerzel, jsondata[i].Ursprung, jsondata[i].Landkreis, jsondata[i].Bundesland]);
   }
   console.log(values)
   connection.query('TRUNCATE TABLE kennzeichnung', function (err, result) {
      if (err) {
         res.send('Error Truncate table');
      }
      else {
         connection.query('INSERT INTO kennzeichnung (ortskuerzel, ursprung, landkreis, bundesland) VALUES ?', [values], function (err, result) {
            if (err) {
               res.send(err);
            }
            else {
               res.send('Success');
            }
         })
      }
   })
   
})
app.get('/ursprung/:ursprungName', function (req, res) {
   let ursprungName = decodeURI(req.params.ursprungName)
   var sql = "SELECT * FROM kennzeichnung WHERE ursprung = ?";
   connection.query(sql, ursprungName, function (err, results, fields) {
      if (err) throw err;
      res.send(results);
   });
});

app.get('/ortskuerzel/:kuerzel', function (req, res) {
   let kuerzel = req.params.kuerzel
   var sql = "SELECT * FROM kennzeichnung WHERE ortskuerzel = ?";
   connection.query(sql, kuerzel, function (err, results, fields) {
      if (err) throw err;
      res.send(results);
   });
});

app.get('/landkreis/:landkreis', function (req, res) {
   let landkreis = decodeURI(req.params.landkreis)
   var sql = "SELECT * FROM kennzeichnung WHERE landkreis = ? ";
   connection.query(sql, landkreis, function (err, results, fields) {
      if (err) throw err;
      res.send(results);
   });
});

app.get('/landkreis', function (req, res) {
   var sql = "SELECT * FROM kennzeichnung ORDER BY landkreis ASC ";
   connection.query(sql, function (err, results, fields) {
      if (err) throw err;
      res.send(results);
   });
});

app.get('/bundesland/:bundesland', function (req, res) {
   let bundesland = decodeURI(req.params.bundesland)
   var sql = "SELECT FROM kennzeichnung WHERE bundesland = ?";
   connection.query(sql, bundesland, function (err, results, fields) {
      if (err) throw err;
      res.send(results);
   });
});

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})