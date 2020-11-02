"use strict";

//---------------------------- Imports -----------------------------------------
var express = require('express');

var bodyParser = require('body-parser');

var _ = require('lodash');

var app = express();

var _require = require('pg'),
    Client = _require.Client;

var fetch = require('node-fetch');

app.use(bodyParser.json()); //-------------------------------------------------------------------------------

var columns = [[[0], [{
  text: 'date',
  type: 'time'
}, {
  text: 'temp',
  type: 'number'
}, {
  text: 'feels_like',
  type: 'number'
}, {
  text: 'temp_min',
  type: 'number'
}, {
  text: 'temp_max',
  type: 'number'
}, {
  text: 'pressure',
  type: 'number'
}, {
  text: 'sea_level',
  type: 'number'
}, {
  text: 'grnd_level',
  type: 'number'
}, {
  text: 'humidity',
  type: 'number'
}, {
  text: 'temp_kf',
  type: 'number'
}, {
  text: 'visibility',
  type: 'number'
}, {
  text: 'pop',
  type: 'number'
}]], [[1], [{
  text: 'date',
  type: 'time'
}, {
  text: 'id',
  type: 'number'
}, {
  text: 'main',
  type: 'string'
}, {
  text: 'description',
  type: 'string'
}, {
  text: 'icon',
  type: 'string'
}, {
  text: 'visibility',
  type: 'number'
}, {
  text: 'pop',
  type: 'number'
}]], [[2], [{
  text: 'date',
  type: 'time'
}, {
  text: 'clouds',
  type: 'number'
}, {
  text: 'visibility',
  type: 'number'
}, {
  text: 'pop',
  type: 'number'
}]], [[3], [{
  text: 'date',
  type: 'time'
}, {
  text: 'speed',
  type: 'number'
}, {
  text: 'deg',
  type: 'number'
}, {
  text: 'visibility',
  type: 'number'
}, {
  text: 'pop',
  type: 'number'
}]]];
var annotation = {
  name: "annotation name",
  enabled: true,
  datasource: "Banco de dados",
  showLine: true
};
var annotations = [{
  annotation: annotation,
  "title": "",
  "time": 1450754160000,
  text: "teeext",
  tags: "taaags"
}, {
  annotation: annotation,
  "title": "",
  "time": 1450754160000,
  text: "teeext",
  tags: "taaags"
}, {
  annotation: annotation,
  "title": "",
  "time": 1450754160000,
  text: "teeext",
  tags: "taaags"
}];
var now = Date.now();
var decreaser = 0;

for (var i = 0; i < annotations.length; i++) {
  var anon = annotations[i];
  anon.time = now - decreaser;
  decreaser += 1000000;
}

function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "accept, content-type");
}

app.all('/', function (req, res) {
  res.send("Servidor ok");
  res.end;
});
app.all('/search', function (req, res) {
  setCORSHeaders(res);
  var resultTar = ['main', 'weather', 'clouds', 'wind'];
  res.json(resultTar);
  res.end();
});
app.all('/annotations', function (req, res) {
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);
  res.json(annotations);
  res.end();
});

function setTable(numCol, arrRows) {
  var table = {
    columns: columns[numCol][1],
    rows: arrRows
  };
  return table;
}

app.all('/query', function (req, res) {
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);
  fetch('http://api.openweathermap.org/data/2.5/forecast?q=Juan%20L.%20Lacaze,%20UY&appid=252ae24cb200bae4f6c7bccbe8530973&units=metric').then(function (response) {
    return response.json();
  }).then(function (mjson) {
    var mapNumCol = {
      "main": 0,
      "weather": 1,
      "clouds": 2,
      "wind": 3
    };
    var arrResF = [];
    var isWeather = false;

    if (req.body.targets[0].target === 'weather') {
      isWeather = true;
    }

    _.each(mjson.list, function (ml) {
      var arrRes = [];
      arrRes.push(ml.dt_txt);

      switch (isWeather) {
        case true:
          _.each(ml[req.body.targets[0].target][0], function (tg) {
            arrRes.push(tg);
          });

          break;

        case false:
          _.each(ml[req.body.targets[0].target], function (tg) {
            arrRes.push(tg);
          });

          break;
      }

      arrRes.push(ml.visibility);
      arrRes.push(ml.pop);
      arrResF.push(arrRes);
    });

    var resultEnd = setTable(mapNumCol[req.body.targets[0].target], arrResF);
    res.json([resultEnd]);
    res.end;
  })["catch"](function (err) {
    return console.log("Erro ao construir o vetor de dados de previsao de vento: ", err);
  });
});
app.all('/tag[\-]keys', function (req, res) {
  setCORSHeaders(res);
  console.log(req.url);
  console.log(req.body);
  res.json(tagKeys);
  res.end();
});
app.all('/tag[\-]values', function (req, res) {
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