var express = require('express');
var routes = require('./index.js');
const bodyParser = require('body-parser');
var port = process.env.PORT || 3000;

var app = express();

app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);
app.use(bodyParser.json());

app.set('view engine', 'ejs');


// ================================================================
// setup routes
// ================================================================
routes(app);

// ================================================================
// start our server
// ================================================================
app.listen(port, function () {
    console.log('Server listening on port ' + port + '...');
});