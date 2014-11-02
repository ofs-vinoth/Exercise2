var fileupload = require('./rest/fileupload');
var multipart = require('connect-multiparty');
//var multipartMiddleware = multipart();

module.exports = function(app) {
	//app.post("/rest/fileupload",  multipartMiddleware, fileupload);
	app.post("/rest/fileupload", fileupload);
}