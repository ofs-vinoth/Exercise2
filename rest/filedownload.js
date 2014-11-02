// we need the fs module for moving the uploaded files
var fs = require('fs');

module.exports =  function(req, res, next) {

		var file = __dirname + "/../files/" + req.query.filename;
		res.download(file);
	}
