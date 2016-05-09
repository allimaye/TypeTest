
    var express = require('express');
    var app = express();
    var logger = require('morgan');

    //Use Morgan for logging
    app.use(logger('dev'));

    //Middleware (allow cross origin requests)
    app.use(function (req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.use(express.static(process.cwd() + '/client'));

    var port = Number(process.env.PORT || '7070');

    app.listen(port, function () {
        console.log('running on port ' + port + '...');
    });