// we need the fs module for moving the uploaded files
var fs = require('fs');

module.exports =  function(req, res, next) {

		console.log(req.query);
		res.writeHead(200);
		console.log(req.headers);
		var destinationFile = fs.createWriteStream(__dirname + "/../files/" + req.query.filename);
		req.pipe(destinationFile);
		 
		var fileSize = req.headers['content-length'];
		var uploadedBytes = 0 ;
		 
		req.on('data',function(d) {
		 
			uploadedBytes += d.length;
			var p = (uploadedBytes/fileSize) * 100;
			res.write("Uploading " + parseInt(p)+ " %\n");		 
		});
		 
		req.on('end',function() {
			res.end("File Upload Complete");
		}); 
		//console.log(req.files);
	
	}
