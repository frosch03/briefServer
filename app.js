// run the command to install formidable
// $ npm install formidable
var formidable = require('formidable');
var http = require('http');
var util = require('util');
var fs = require('fs');
var os = require('os');
var sys = require('sys');
var latex = require('gammalatex');

var app = http.createServer(
 function(req, res){
  switch(req.method){
   case 'GET':
    showPage(req, res);
    break;
   case 'POST':
    upload(req, res);
    break;
  }
 }
);
app.listen(8080);

//Display my IP
var networkInterfaces=os.networkInterfaces();

for (var interface in networkInterfaces) {
    
    networkInterfaces[interface].forEach(
        function(details){
            
            if (details.family=='IPv4' 
                && details.internal==false) {
                    console.log(interface, details.address);  
        }
    });
}

function showPage(req, res){
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
   if (err) {
    res.writeHead(500);
    return res.end('Error loading index.html');
   }
  
   res.writeHead(200);
   res.end(data); 
  });
}

function upload(req, res){

    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        console.log("Letter to " + fields.nachname + " about " + fields.subject + " recieved");
        var file = __dirname + '/' + fields.nachname + fields.subject + '.pdf';

        latex.parse(fields.latex, function(err, readStream) {
            if(err) throw err;
         
            var writeStream = 
                fs.createWriteStream(file);
            util.pump(readStream, writeStream);
            console.log("Latex file transcoded");
        });

        latex.setPostParseHook( function (params, cb) {
            fs.readFile(params.outputFilePath, function (err, data) {
                if (err) {
                    res.writeHead(500);
                    console.log(params.outputFilePath);
                    return res.end('Error loading ' + params.outputFilePath);
                }
                res.writeHead(200, {'content-type': 'application/pdf', 'mime-type': 'application/pdf'});
                res.end(data); 
            });

            fs.readFile(params.outputFilePath, function (err, data) {
                if (err) {
                    console.log('Error writing file to server-dir');
                }
                fs.writeFile(file, data);
            });
        });
    });
}
