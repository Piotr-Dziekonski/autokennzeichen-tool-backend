var mysql = require('mysql');

const {
    createPool
} = require('mysql');

const pool = createPool({
    host: '127.0.0.1',
    user:'root',
    password:'AHutani',
    database: 'kfz',
    connectionLimit : 10
})

var connection = mysql.createConnection({            
    host: '127.0.0.1',
    user:'root',
    password:'AHutani',
    database: 'kfz'
    
});

pool.query(`SELECT * FROM kfz.kennzeichnung`, (err, result, fields) => {
    if(err){
        return console.log(err);
    }
    for (const [key, value] of Object.entries(fields)){
        console.log(key, value);
    }
    // fields.forEach(element => {
    //     console.log(element.name);
    // });
    //return console.log(fields[1].name);
});
    


module.exports = connection;
