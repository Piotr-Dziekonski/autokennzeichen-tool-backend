var express = require("express");
var app = express();
var connection = require('./database');

app.get('/', function(req, res){
   let sql = "SELECT * FROM kennzeichnung";
   connection.query(sql, function(err, results, fields){
       if (err) throw err;
       res.send(results);
       
   });
});

app.get('/ursprung/:ursprungName', function(req, res){
   let ursprungName = req.params.ursprungName
   var sql = "SELECT * FROM kennzeichnung WHERE ursprung = ?";
   connection.query(sql, ursprungName, function(err, results, fields){
       if (err) throw err;
       res.send(results);
   });
});

app.get('/ortskuerzel/:kuerzel', function(req, res){
   let kuerzel = req.params.kuerzel
   var sql = "SELECT * FROM kennzeichnung WHERE ortskuerzel = ?";
   connection.query(sql, kuerzel, function(err, results, fields){
       if (err) throw err;
       res.send(results);
   });
});

app.get('/landkreis/:landkreis', function(req, res){
   let landkreis = req.params.landkreis
   var sql = "SELECT * FROM kennzeichnung WHERE landkreis = *?* ";
   connection.query(sql, landkreis, function(err, results, fields){
       if (err) throw err;
       res.send(results);
   });
});

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})