const express = require("express");
const bodyParser = require("body-parser")
const app = express();
const connection = require('./database');
const cors = require('cors');
const fs = require("fs");
const path = require("path");
const multer = require('multer')
const convert = require('xml-js');
const { parse } = require('json2csv');
const csv = require('csvtojson');
const upload = multer({
   dest: 'uploads/'
})
const parser = require('xml2json')

var corsOptions = {
   allowedHeaders: 'Content-Type, requested-type'
}

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.get('/', function (req, res) {
   let sql = "SELECT * FROM kennzeichnung ORDER BY Ortskuerzel ASC";
   connection.query(sql, function (err, results, fields) {
      if (err) throw err;
      res.send(results);
   });
});

app.post('/importFromFile', upload.single('uploadedFile'), async function (req, res, next) {
   const absolutePath = path.join(__dirname, req.file.path);
   let jsonObject;
   
   if(req.file.mimetype == "application/json"){
      const jsonString = fs.readFileSync(absolutePath, "utf-8");
      jsonObject = JSON.parse(jsonString);
   } else if (req.file.mimetype == "text/csv" || req.file.mimetype == "application/vnd.ms-excel") {
      await csv().fromFile(absolutePath).then((jsonObj) => {
         jsonObject = jsonObj;
      })
   } else if (req.file.mimetype == "text/xml"){
      const xmlString = fs.readFileSync(absolutePath, "utf-8");
      jsonObject = parser.toJson(xmlString)
      jsonObject = JSON.parse(jsonObject).elements
      console.log(jsonObject)
   }
   await importLicensePlates(jsonObject, res);
})

app.post('/addLicensePlate/:Ortskuerzel/:Ursprung/:Landkreis/:Bundesland', function (req, res) {
   const values = [req.params.Ortskuerzel, req.params.Ursprung, req.params.Landkreis, req.params.Bundesland]
   let query = `INSERT INTO kennzeichnung (ortskuerzel, ursprung, landkreis, bundesland) VALUES (?,?,?,?)`
   connection.query(query, values, function(err, result) {
      if(err) {
         console.log(err)
      }else{
         res.send("SUCCESS")
      }
   })
})

async function importLicensePlates(requestBody, res) {
   let values = []
   Object.keys(requestBody).forEach((val, i) => {
      values.push([requestBody[val].Ortskuerzel, requestBody[val].Ursprung, requestBody[val]["Region"], requestBody[val].Bundesland]);
   })
   connection.query('TRUNCATE TABLE kennzeichnung', function (err, result) {
      if (err) {
         res.send('Error Truncate table');
      } else {
         connection.query('INSERT INTO kennzeichnung (ortskuerzel, ursprung, landkreis, bundesland) VALUES ?', [values], function (err, result) {
            if (err) {
               res.send(err);
            } else {
               res.send('Success');
            }
         })
      }
   })
}

async function exportLicensePlates(req, res) {
   let query = `SELECT Ortskuerzel as Ortskuerzel, Ursprung as Ursprung, Landkreis AS 'Region', Bundesland AS Bundesland FROM kennzeichnung ORDER BY Ortskuerzel ASC`
   connection.query(query, function (err, result) {
      if (err) {
         console.log(err)
         res.send('Error while exporting JSON file from the database');
      } else {
         if (req.get("Requested-Type") === "application/json") {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.write(JSON.stringify(result))
            res.end()
         } else if (req.get("Requested-Type") === "text/xml") {
            let formattedResult = []
            formattedResult["elements"] = {}
            result.forEach((value, index) => {
               formattedResult["elements"]["elem"+index] = value
            });
            res.send(convert.json2xml(formattedResult, {
               compact: true,
               ignoreComment: true,
               spaces: 4
            }))
         } else if (req.get("Requested-Type") === "text/csv") {
            res.send(parse(result))
         }
      }
   })
}

app.post("/import", function (req, res) {
   importLicensePlates(req.body, res)
})

app.get("/export", async function (req, res) {
   await exportLicensePlates(req, res)
})

app.get('/ursprung/:ursprungName', function (req, res) {
   let ursprungName = decodeURI(req.params.ursprungName)
   var sql = "SELECT * FROM kennzeichnung WHERE ursprung LIKE concat('%', ?, '%')";
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
      } else {
         res.send("SUCCESS")
      }
   })
});

app.get('/ortskuerzel/:kuerzel', function (req, res) {
   let kuerzel = req.params.kuerzel
   var sql = "SELECT * FROM kennzeichnung WHERE ortskuerzel LIKE concat('%', ?, '%') ORDER BY Ortskuerzel ASC";
   connection.query(sql, kuerzel, function (err, results, fields) {
      if (err) throw err;
      res.send(results);
   });
});

app.get('/landkreis/:landkreis', function (req, res) {
   let landkreis = decodeURI(req.params.landkreis)
   var sql = "SELECT * FROM kennzeichnung WHERE landkreis LIKE concat('%', ?, '%') ORDER BY Ortskuerzel ASC";
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
   var sql = "SELECT * FROM kennzeichnung WHERE bundesland LIKE concat('%', ?, '%') ORDER BY Ortskuerzel ASC";
   connection.query(sql, bundesland, function (err, results, fields) {
      if (err) throw err;
      console.log(results)

      res.send(results);
   });
});

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})