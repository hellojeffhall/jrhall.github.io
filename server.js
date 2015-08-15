var http = require('http');
var fs = require('fs');

var files_whitelist = {
  '/'           : 'tool.html',
  '/index.html' : 'tool.html',
  '/tool.js'    : 'tool.js',
  '/tool.css'   : 'tool.css'
};


var server = http.createServer( function(request, response) {
  if(files_whitelist[request.url]!==undefined){
    response.writeHead(200, {});
    fs.createReadStream(files_whitelist[request.url]).pipe(response); 
  }
  else{
    response.writeHead(400, {});
    response.end('File not found.');

  }
}).listen(8080);
