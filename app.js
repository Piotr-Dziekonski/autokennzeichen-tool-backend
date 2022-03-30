const express = require("express");
const bodyParser = require("body-parser")
const app = express();
const connection = require('./database');
const cors = require('cors');
const fs = require("fs");
const path = require("path");
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const convert = require('xml-js');

app.use(cors());



app.use(bodyParser.json());

app.get('/', function (req, res) {
   let sql = "SELECT * FROM kennzeichnung";
   connection.query(sql, function (err, results, fields) {
      if (err) throw err;
      res.send(results);
   });
});

app.post('/importFromFile', upload.single('uploadedFile'), async function (req, res, next) {
   const absolutePath = path.join(__dirname, req.file.path);
   const jsonString = fs.readFileSync(absolutePath, "utf-8");
   const jsonObject = JSON.parse(jsonString);
   await importLicensePlates(jsonObject, res);
})

async function importLicensePlates(requestBody, res) {
   let values = []
   for (var i = 0; i < Object.keys(requestBody).length; i++) {
      values.push([requestBody[i].Ortskuerzel, requestBody[i].Ursprung, requestBody[i]["Stadt/Landkreis"], requestBody[i].Bundesland]);
   }
   console.log(requestBody)
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
}

async function exportLicensePlates(requestBody, res, type) {
   let query = `SELECT Ortskuerzel as Ortskuerzel, Ursprung as Ursprung, Landkreis AS 'Stadt/Landkreis', Bundesland AS Bundesland FROM kennzeichnung`
   connection.query(query, function (err, result) {
      if (err) {
         console.log(err)
         res.send('Error while exporting JSON file from the database');
      }
      else {
         if(type === "json"){
            res.send(JSON.stringify(result));
         } else if(type === "xml"){
            res.send(convert.json2xml(result, { compact: true, ignoreComment: true, spaces: 4 }))
         }
      }
   })
}

app.post("/import", function (req, res) {
   importLicensePlates(req.body, res)
})

app.get("/exportJson", async function (req, res) {
   await exportLicensePlates(req.body, res, "json")
})
app.get("/exportXml", async function (req, res) {
   await exportLicensePlates(req.body, res, "xml")
})



app.get('/ursprung/:ursprungName', function (req, res) {
   let ursprungName = decodeURI(req.params.ursprungName)
   var sql = "SELECT * FROM kennzeichnung WHERE ursprung = ?";
   connection.query(sql, ursprungName, function (err, results, fields) {
      if (err) throw err;
      res.send(results);
   });
});

app.get('/deletedb', function (req, res) {
   console.log("Deleting DB...")
   connection.query('TRUNCATE TABLE kennzeichnung', function (err, result) {
      if (err) {
         res.send('Error Truncate table');
      }
      else {
         res.send("SUCCESS")
      }
   })
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