

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var routes = require('./routes/index');
var users = require('./routes/user');

var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';
var session    = require('express-session'),
    MongoStore = require('connect-mongo')(session);
// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});

//var dbConnectionString=config.dbConnectionString;
    //connecting to database
    mongoose.connect("mongodb://localhost:27017/intangles");

     var db = mongoose.connection;

    mongoose.connection.on('open',function(){
        
        console.log("mongoose connection opened....");
    
    });

     db.on('error', function () {
        throw new Error('unable to connect to database at ');
    });   

app.use(session({
      cookie: { maxAge: 1000*60*60*24, path : '/user/sendMessage'} ,

      secret: "database" ,
      store:new MongoStore({
              //url : config.dbConnectionStringForSessions,
              db: "mongodb://localhost:27017/intangles",
              mongooseConnection:mongoose.connection, 
              saveUninitialized:false,
              resave: false,
              collection: 'session', 
              stringify:false,
      }),
      saveUninitialized: false,
      resave: false
  },function(err){
    console.log(err || 'connect-mongodb setup ok');
  }));

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});


module.exports = app;
