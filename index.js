var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();
const { Client } = require('pg');

app.use(bodyParser.json());

//-----------------------------

// Conexão com o banco de dados PostgreSQL

const connectionString = 'postgres://postgres:senhateste@localhost:5432/cepel';

const client = new Client({
    connectionString: connectionString
});

client.connect();

//-----------------------------

// Gerador de dados

function geradorDados(){
  const aeros = ["AERO1", "AERO2", "AERO3", "AERO4"];
  var vel_vento = 0;
  var potencia_real = 0;
  var potencia_calculada = 0;
  var alarme = 0;

  for (var i = 0; i < 4; i++){
    vel_vento = Math.random() * (15 - 0);
    potencia_real = Math.random() * (1300 - 500) + 500;
    potencia_calculada = Math.random() * (potencia_real - 500) + 500;
    if (potencia_calculada < potencia_real*0.7){
      alarme = 1;
    }else{
      alarme = 0;
    }

    client.query('INSERT INTO teste (aerogerador, vel_vento, potencia_real, potencia_calculada, alarme) values ($1, $2, $3, $4, $5)',[aeros[i], vel_vento, potencia_real, potencia_calculada, alarme], function (err, result) {
      if (err) {
        console.log(err);
      }
    });
  }
};

geradorDados();
setInterval( geradorDados, 1*60*1000 );
//-----------------------------



var annotation = {
  name : "annotation name",
  enabled: true,  
  datasource: "Banco de dados",
  showLine: true,
}

var annotations = [
  { annotation: annotation, "title": "", "time": 1450754160000, text: "teeext", tags: "taaags" },
  { annotation: annotation, "title": "", "time": 1450754160000, text: "teeext", tags: "taaags" },
  { annotation: annotation, "title": "", "time": 1450754160000, text: "teeext", tags: "taaags" }
];

var tagKeys = [
  {"type":"string","text":"Country"}
];

var countryTagValues = [
  {'text': 'SE'},
  {'text': 'DE'},
  {'text': 'US'}
];

var now = Date.now();
var decreaser = 0;
for (var i = 0;i < annotations.length; i++) {
  var anon = annotations[i];

  anon.time = (now - decreaser);
  decreaser += 1000000
}

function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "accept, content-type");  
}

app.all('/', function(req, res){
  res.send("Servidor ok")
  res.end;
});

app.all('/search', function(req, res){
  setCORSHeaders(res);
  var resultTar = ["AERO1", "AERO2", "AERO3", "AERO4", "Todos"];
  /*client.query('SELECT aerogerador FROM teste', function (err, result) {
    console.log(result.rows);
    if (err) {
        console.log(err);
    }
    
    _.each(result.rows, function(rr){
      resultTar.push(rr.aerogerador);
    });*/
    res.json(resultTar);
    res.end();
});

app.all('/annotations', function(req, res) {
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);

  res.json(annotations);
  res.end();
});

function receberResQuery(result, res){
  var tsResult = [];

  var now = Date.now();
  var decreaser = 0;
  var arrayTable = []
  _.each(result.rows, function(ts){
    arrayTable.push([ts.id, ts.aerogerador, ts.vel_vento, ts.potencia_real, ts.potencia_calculada, ts.alarme, (now - decreaser)]);
    decreaser += 1000000;
  });
  var table =
      {
        columns: [{text: 'ID', type: 'number'}, {text: 'Aerogerador', type: 'string'}, {text: 'Velocidade do Vento', type: 'number'}, {text: 'Potência Real', type: 'number'}, {text: 'Potência Calculada', type: 'number'}, {text: 'Alarme', type: 'number'}, {text: 'Hora', type:'time'}],
        rows: arrayTable
      };
      //tsResult.push(table);
      res.json([table]);
      res.end();
}

app.all('/query', function(req, res){
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);

  if (req.body.adhocFilters && req.body.adhocFilters.length > 0) {
    fakeData = countryTimeseries;
  }

  _.each(req.body.targets, function(target) {
    console.log(target.target);
    if (target.type === 'table') {
      if (target.target === null || target.target === 'Todos'){
        client.query('SELECT * FROM teste', function (err, result) {
          console.log(result.rows)
          if (err) {
              console.log(err);
          }
          receberResQuery(result, res);
        });
      }else{
        client.query('SELECT * FROM teste WHERE aerogerador = $1', [target.target], function (err, result) {
          if (err) {
            console.log(err);
          }
          receberResQuery(result, res);
        });
      }
    } 
  });
});

app.all('/tag[\-]keys', function(req, res) {
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);

  res.json(tagKeys);
  res.end();
});

app.all('/tag[\-]values', function(req, res) {
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);

  if (req.body.key == 'City') {
    res.json(cityTagValues);
  } else if (req.body.key == 'Country') {
    res.json(countryTagValues);
  }
  res.end();
});

app.listen(3333);

console.log("Server is listening to port 3333");