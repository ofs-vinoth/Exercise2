// we need the fs module for moving the uploaded files
var fs = require('fs');

module.exports =  function(req, res, next) {
		
		var filepath = __dirname + "/../files/" + req.query.filename;
		res.writeHead(200);
		var destinationFile = fs.createWriteStream(filepath);
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
		
		/* var buffer = new Buffer(this.data);
		fs.writeFileSync(filepath, buffer);
 */	
	}
