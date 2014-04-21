// run the command to install formidable
// $ npm install formidable
var formidable = require('formidable');
var http = require('http');
var util = require('util');
var fs = require('fs');
var os = require('os');
var sys = require('sys');
var latex = require('gammalatex');
var qs = require('querystring');
var url = require('url');
var path = require('path');

var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css",
    "pdf": "application/pdf"};


var app = http.createServer(function(req, res) {
    switch(req.method){
    case 'GET':
        var uri = url.parse(req.url).pathname;
        var filename = decodeURI(path.join(process.cwd(), uri));
        fs.exists(filename, function(exists) {
            if(!exists) {
                console.log("not exists: " + filename);
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.write('404 Not Found\n');
                res.end();
            }
            var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
            res.writeHead(200, {
                'Mime-Type': mimeType + ';charset=utf8',
                'Content-Type': mimeType + ';charset=utf8',
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Credentials': 'true'});
                         

            var fileStream = fs.createReadStream(filename);
            fileStream.pipe(res);
        }); 
        

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

function upload(req, res) {

    if (req.method == 'POST') {
        var body = '';
        req.on('data', function (data) {
            body += data;
        });
        req.on('end', function () {
            var POST = qs.parse(body);
            var fields = {
                latex:    JSON.parse(POST.message).latex,
                nachname: JSON.parse(POST.message).nachname,
                subject:  JSON.parse(POST.message).subject
            }

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
                });

                fs.readFile(params.outputFilePath, function (err, data) {
                    if (err) {
                        console.log('Error writing file to server-dir');
                    }
                    fs.writeFile(file, data);
                });
                var splitTmp = file.split('/');
                var realFile = encodeURIComponent(splitTmp[splitTmp.length -1]);

                res.writeHead(200,
                              {'Access-Control-Allow-Origin': '*', 
                               'Access-Control-Allow-Credentials': 'true'}
                             );
                res.write(JSON.stringify({'url': 'http://192.168.0.17:8080/' + realFile}));
                res.end();
            });

        });

    }
}
