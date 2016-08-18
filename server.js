// kinda like a #include <http.h>
// brings in some library code
var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var url = require('url');
var express = require('express');
var app = express();
var markdown = require('markdown').markdown;
var currentDirectory = __dirname + '/';



// creates a http server
var server = http.createServer(function (request, response) {
    // every time a request comes from a browser
    // this code is executed
    


    // accept POST request on the homepage
    app.post('/', function (req, res) {
        res.send('Got a POST request');
    })


    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=


    console.log(request.method);
    if (request.url === '/')
    {
        var blogPostsFolder = currentDirectory + 'blog-posts/';
        
        fs.readdir(blogPostsFolder, function(err, files) {
            if (err) {
                console.log(err);
            }
            
            // files is an array of blog posts titles / filenames
            
            console.log(files);
            
            // read in our home template
            fs.readFile(currentDirectory + 'templates/home', 'utf8', function(err, templateString) {
                if (err) {
                    console.log(err);
                }
                
                templateString = '' + templateString;
                var htmlForPosts = templateString.getTextBetweenTokens("{{REPEAT}}", "{{ENDREPEAT}}");
                var blogPosts = '';
                
                files.forEach(function(blogPost) {
                    blogPosts += htmlForPosts.replace('{{Post1.Link}}', '/post/' + blogPost)
                                             .replace('{{Post1.Title}}', blogPost);
                });
                
                var html = templateString.replace('{{Title}}', 'Latest blog posts')
                                         .replaceContents("{{REPEAT}}", "{{ENDREPEAT}}", blogPosts);
                
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(html);
            });
        });
    }
    
    

    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=


    if (request.url.startsWith('/edit/')) 
    {
    	fs.readFile(currentDirectory + 'templates/edit', 'utf8', function(err, template) {
            if (err) console.log(err);
               
      	    response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(template);
        });
    }

    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=


    if (request.url.startsWith('/submit'))
    {

        // MyVariableOne=ValueOne&MyVariableTwo=ValueTwo
        console.log(request.querystring);

        if (request.method == 'POST') {
            console.log("[200] " + request.method + " to " + request.url);
          
         
        } else {
            console.log("[405] " + request.method + " to " + request.url);
            response.writeHead(405, "Method not supported", {'Content-Type': 'text/html'});
            response.end('<html><head><title>405 - Method not supported</title></head><body><h1>Method not supported.</h1></body></html>');
        }



        var postContents = 'wtf';

        fs.writeFile("/tmp/test", "Hey there!", function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("The file was saved!");
            }
        });

    }
    

    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=



    if (request.url.startsWith('/preview/'))
    {
        var jsonString = '';
        request.on('data', function (data) {
            jsonString += data;
        });

        request.on('end', function (){
            var theObject = JSON.parse(jsonString);
            console.log(theObject.title);
            console.log(theObject.main);
            theObject.title = markdown.toHTML(theObject.title);
            theObject.main = markdown.toHTML(theObject.main); 
            
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(theObject));
        });
    }
    


    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=


    if (request.url.startsWith('/post/'))
    {
        fs.readFile(currentDirectory + 'templates/entry', 'utf8', function(err, template) {
            if (err) console.log(err);
            var blogFileName = currentDirectory + 'blog-posts/' + getFileName(request.url);
            fs.readFile(blogFileName, 'utf8', function(err, postMarkUp) {
                var post = markdown.toHTML(postMarkUp);
                
                var html = '';
                
                // TODO: you have three strings, one called 'template' which is the template with tokens
                // and the second called 'post' which is the contents of the blog post file
                // and 'html' which is the string that will be sent back to the browser
                
                html = template.replace('{{Contents}}', post);
                
               
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.end(html);
            });
        });
    }
    
    if (request.url.indexOf('.css') !== -1)
    {
    
        // read the html file
        // and spit them into the response
        fs.readFile(currentDirectory + 'css' + request.url, 'utf8', function (err,data) {
            if (err) {
                response.writeHead(404, {'Content-Type': 'text/html'});
                response.end('Ooops ' + request.url + ' couldnt be found!');
                return console.log(err);
            }
            
            console.log(request.url);
            var type =  getFileExtension(request.url);
            console.log(type);
            
            response.writeHead(200, {'Content-Type': 'text/' + type});
            response.end(data);
        });
    }
});




    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=
    //=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=#=



// /asda/sadasd/asdasd/aaa.cccc
// cccc
var getFileExtension = function(url) {
    var indexOfDot = url.lastIndexOf('.');
    return url.substring(indexOfDot + 1);
};

var getFileName = function(url) {
    var indexOfSlash = url.lastIndexOf('/');
    return url.substring(indexOfSlash + 1);
};

String.prototype.startsWith = function(str) {
    return this.indexOf(str) === 0;
};

String.prototype.replaceContents = function(token1, token2, newContents) {
    var startTokenPos = this.indexOf(token1);
    var endTokenPos = this.indexOf(token2) + token2.length;
    
    var strToReplace = this.substring(startTokenPos, endTokenPos);
    
    return this.replace(strToReplace, newContents);
};

String.prototype.getTextBetweenTokens = function(token1, token2) {
    var startTokenPos = this.indexOf(token1) + token1.length;
    var endTokenPos = this.indexOf(token2);
    
    return this.substring(startTokenPos, endTokenPos);
};

var postObject = function(url, obj, callback) {
                var xmlhttp = new XMLHttpRequest();

                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState === 4) {
                       if(xmlhttp.status === 200){
                           callback(null, xmlhttp.responseText);
                       }
                       else {
                            callback(xmlhttp, null);
                       }
                    }
                };

                xmlhttp.open('POST', url, true)
                xmlhttp.setRequestHeader('Content-type','application/json');
                xmlhttp.send(JSON.stringify(obj));
            };




// binds the server to the port and ip
server.listen(1337, '0.0.0.0');

// like a printf
console.log('Server running at http://localhost:1337/');
