
// Bulk AMP Validator

var infilepath = 'input.txt';
var outfilepath = 'output.txt';

var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var amphtmlValidator = require('amphtml-validator');
var http = require('https');
var instream = fs.createReadStream(infilepath);
var outstream = new stream;
var rl = readline.createInterface(instream, outstream);
var outfile = fs.createWriteStream(outfilepath);

var total = 0;
var tally = 0;
var tot_pass = 0;
var tot_fail = 0;

//process.on('uncaughtException', function (err) {
//    console.log(err);
//}); 

rl.on('line', function(line) {
    total++;
    // for each URL in the input file  
    var url = line;


    var req = http.get(url, function(res){    
        res.setEncoding('utf8');
        var htmldata = '';
     
        res.on('data', function(chunk){            
            htmldata += chunk;
        });
        res.on('end', function() {                  
                amphtmlValidator.getInstance().then(function (validator) {    
                    var result = validator.validateString(htmldata);        
                    outfile.write (' ' + '\n');
                    outfile.write (result.status + ' ' + line + '\n');
                    outfile.write (' ' + '\n');
                    console.log(result.status + ' ' + line);                     
                    result.status == 'PASS' ? tot_pass++ : tot_fail++;
                    for (var ii = 0; ii < result.errors.length; ii++) {
                        var error = result.errors[ii];
                        var msg = 'line ' + error.line + ', col ' + error.col + ': ' + error.message;                        
                        if (error.specUrl !== '') {                           
                            msg += ' (see ' + error.specUrl + ')';
                        }
                        outfile.write (msg + '\n');
                    }                        
                    tally++;
                    if (tally == total) {
                        console.log('---------------------------------------------');
                        console.log('Total URLS: ' + total);
                        console.log('Total Failed: ' + tot_fail);
                        console.log('Total Passed: ' + tot_pass);    
                        console.log('---------------------------------------------');
                        console.log('Results are in output.txt');                
                    }
                });            
          });
    });

    req.on('error', function(e) {
        console.log('ERROR' + e);
    });

});

