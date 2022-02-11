var express = require("express");
var app = express();
var connection = require('./database');
//var config = require('./config.json');

app.get('/', function(req, res){
    let sql = "SELECT * FROM kfz.kennzeichnung";
    connection.query(sql, function(err, results, fields){
        if (err) throw err;
        res.send(fields);
        
    });
});

app.listen(3000, function(){
    console.log('App listening on port 3000');
    connection.connect(function(err){
        if(err) {
            return console.error('error: '+ err.message);
        };
        console.log("MySQL Server ist verbunden");
    })
});

