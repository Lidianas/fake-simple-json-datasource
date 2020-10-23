var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();
var mysql =  require('mysql');

app.use(bodyParser.json());

//-----------------------------

// Conexão com o banco de dados

/*const bd =  mysql.createConnection ({
host: 'localhost',
user: 'user',
password: 'senha',
database: 'base de dados'
// OBS: ALTERAR DADOS ANTES DE INICIAR O SERVIDOR
});

bd.connect((err) => {
if(err){ throw err};
console.log("Conexão com a base de dados estabelecida com sucesso.")
});


//Essa query efetivamente não está sendo usada ainda, os dados estão sendo lidos de um arquivo .json gerado pelo MySQL
function query(/* Aqui pode entrar alguns parametros para serem usados na query */
  /*let query = "SELECT id, aerogerador, vel_vento FROM teste;";
  return bd.query(query);
};

var q = query();
*/
//-----------------------------

var countryTimeseries = require('./country-series');
/*
* resTeste foi gerado por uma query executada diretamente no shell do MySQL,
* porque não foi possível alterar a pasta destino, que é uma estabelecida pelo MySQL
* inacessível para mim, mesmo usando 'sudo' (deve ser um problema local). 
* A depender do banco de dados, a query pode ser realizada neste código mesmo, por isso o exemplo de conexão 
* ao banco ali em cima. 
* Sugiro tentar alterar a pasta destino até para poder visualizar a saída dos dados sem precisar rodar a aplicação
*/
var timeserie = require('/var/lib/mysql-files/resTeste');

var now = Date.now();
for (var i = timeserie.length -1; i >= 0; i--) {
  var series = timeserie[i];
  var decreaser = 0;
}

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

/*
* Este é o modo como o Grafana 'aceita' os dados. Somente escrito diretamente aqui.

var table =
  {
    columns: [{text: 'Time', type: 'time'}, {text: 'Country', type: 'string'}, {text: 'Number', type: 'number'}],
    rows: [
      [ 1234567, 'SE', 123 ],
      [ 1234567, 'DE', 231 ],
      [ 1234567, 'US', 321 ],
    ]
  };
*/

var now = Date.now();
var decreaser = 0;
var arrayTable = []
_.each(timeserie, function(ts){
  arrayTable.push([ts.id, ts.aerogerador, ts.vel_vento, (now - decreaser)]);
  decreaser += 1000000;
});

var table =
{
  columns: [{text: 'ID', type: 'number'}, {text: 'AERO', type: 'string'}, {text: 'Velocidade do Vento', type: 'number'}, {text: 'hora', type:'time'}],
  rows: arrayTable
};
  
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
  var result = [];
  result.push("Todos");
  for(var i = 0; i < 12; i++){
    result.push(timeserie[i].aerogerador)
  }

  res.json(result);
  res.end();
});

app.all('/annotations', function(req, res) {
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);

  res.json(annotations);
  res.end();
});

app.all('/query', function(req, res){
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);

  var tsResult = [];
  let fakeData = timeserie;

  if (req.body.adhocFilters && req.body.adhocFilters.length > 0) {
    fakeData = countryTimeseries;
  }

  _.each(req.body.targets, function(target) {
    if (target.type === 'table') {
      tsResult.push(table);
    } 
  });

  //quando se tenta enviar direto a 'table' sem colocar no 'tsResult' (um array), o Grafana dá erro de tipo de resposta inesperada
  console.log("-----------------")
  console.log("Valores da tabela")
  console.log("-----------------")
  console.log(table);
  console.log("-----------------")
  console.log("Valores enviados")
  console.log("-----------------")
  console.log(tsResult)
  console.log("-----------------")
  res.json(tsResult);
  res.end();
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