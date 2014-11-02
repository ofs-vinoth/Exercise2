var fileupload = require('./rest/fileupload');
var filedownload = require('./rest/filedownload');
//var multipart = require('connect-multiparty');
//var multipartMiddleware = multipart();

module.exports = function(app) {
	//app.post("/rest/fileupload",  multipartMiddleware, fileupload);
	app.post("/rest/fileupload", fileupload);
	app.get("/rest/filedownload", filedownload);
}