var http = require('http');
var https = require('https');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var fs = require('fs');
var cluster = require('cluster');
var domain = require('domain');

var router = require('./router');

var app = express();
router(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'w'})

// setup the logger
app.use(logger('dev', {stream: accessLogStream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
});

var credentials = {
  key: fs.readFileSync(__dirname + '/conf/sslcert/mykey.pem', 'utf8'),
  cert: fs.readFileSync(__dirname + '/conf/sslcert/mycert.pem', 'utf8')
};

var numCPUs = require('os').cpus().length;
if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('fork', function(worker) {
	console.log('worker ' + worker.process.pid + ' started');
  });
  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });
} else {

	var httpsServer = https.createServer(credentials, app, function(req, res) {
		var d = domain.create();
		d.on('error', function(er) {
		  console.error('error', er.stack);

		  // Note: we're in dangerous territory!
		  // By definition, something unexpected occurred,
		  // which we probably didn't want.
		  // Anything can happen now!  Be very careful!

		  try {
			// make sure we close down within 30 seconds
			var killtimer = setTimeout(function() {
			  process.exit(1);
			}, 30000);
			// But don't keep the process open just for that!
			killtimer.unref();

			// stop taking new requests.
			server.close();

			// Let the master know we're dead.  This will trigger a
			// 'disconnect' in the cluster master, and then it will fork
			// a new worker.
			cluster.worker.disconnect();

			// try to send an error to the request that triggered the problem
			res.statusCode = 500;
			res.setHeader('content-type', 'text/plain');
			res.end('Oops, there was a problem!\n');
		  } catch (er2) {
			// oh well, not much we can do at this point.
			console.error('Error sending 500!', er2.stack);
		  }
		});

		// Because req and res were created before this domain existed,
		// we need to explicitly add them.
		// See the explanation of implicit vs explicit binding below.
		d.add(req);
		d.add(res);

		// Now run the handler function in the domain.
		d.run(function() {
		  //handleRequest(req, res);
		  app.router(req, res, next);
		});
 
	});

	var server = httpsServer.listen(8000, function () {
	  var host = server.address().address;
	  var port = server.address().port;

	  console.log('App listening at http://%s:%s', host, port);	  
	})
}


module.exports = app;
