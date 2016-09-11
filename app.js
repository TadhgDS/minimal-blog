var http = require('http');
var fs = require('fs');
var url = require('url');
var markdown = require('markdown').markdown;
var currentDirectory = __dirname + '/';
var express = require('express');


var app = express();

var bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: false
})); 

var multer = require('multer'); 
app.use(multer());



app.get('/blog.css',function(req,res){
	// read the html file
    // and spit them into the response
    fs.readFile(currentDirectory + 'css/blog.css', 'utf8', function (err,data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('Ooops ' + 'css/blog.css' + ' couldnt be found!');
            return console.log(err);
        }
        
        var type =  getFileExtension('css/blog.css');
       
        res.writeHead(200, {'Content-Type': 'text/' + type});
        res.end(data);
    });
});

app.get('/normalize.css',function(req,res){
	// read the html file
    // and spit them into the response
    fs.readFile(currentDirectory + 'css/blog.css', 'utf8', function (err,data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('Ooops ' + 'css/blog.css' + ' couldnt be found!');
            return console.log(err);
        }
        
        var type =  getFileExtension('css/blog.css');
        
        res.writeHead(200, {'Content-Type': 'text/' + type});
        res.end(data);
    });
});





app.get('/post*',function(req,res)	{   
    var blogPostsFolder = currentDirectory + 'blog-posts/'; 

    var postExits = doesBlogPostExist(getFileName(req.url));
    if(postExits){

        console.log("gets this far?");

        fs.readFile(currentDirectory + 'templates/entry', 'utf8', function(err, template) {
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.end('Ooops ' + req.url + ' couldnt be found!');
                return console.log(err);
            }
            var blogFileName = blogPostsFolder + getFileName(req.url);
            fs.readFile(blogFileName, 'utf8', function(err, postMarkUp) {            


                var jsonString = JSON.parse(postMarkUp);
                var post = markdown.toHTML(jsonString.mainText);
        
                var sidenoteWithTags;
                if(post.indexOf("{{1}}") > -1){
                    sidenoteWithTags = "<aside>" + jsonString.sn1 + "</aside>"; 
                    post = post.replace("{{1}}",sidenoteWithTags);
                }
                if(post.indexOf("{{2}}") > -1){
                    sidenoteWithTags = "<aside>" + jsonString.sn2 + "</aside>";
                    post = post.replace("{{2}}",sidenoteWithTags);
                }
                if(post.indexOf("{{3}}") > -1){        
                    sidenoteWithTags = "<aside>" + jsonString.sn3 + "</aside>";
                    post = post.replace("{{3}}",sidenoteWithTags);
                }
                if(post.indexOf("{{4}}") > -1){                
                    sidenoteWithTags = "<aside>" + jsonString.sn4 + "</aside>";
                    post = post.replace("{{4}}",sidenoteWithTags);
                }
                if(post.indexOf("{{5}}") > -1){
                    sidenoteWithTags = "<aside>" + jsonString.sn5 + "</aside>";
                    post = post.replace("{{5}}",sidenoteWithTags);
                }

                var html = '';
                html = template.replace('{{Contents}}', post);
                html = html.replace('{{Title}}', jsonString.title);
                html = html.replace('{{Date}}', getDateString(jsonString.submitDate));
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(html);
            });   
        });
    }
});

app.post('/submit*',function(req,res){
    
    if (req.method == 'POST') {
        console.log("[200] " + req.method + " to " + req.url);

        res.json(req.body.title + req.body.textarea);
        var title = req.body.title;
        title = title.replace(/ /g,"-");
        var textarea = req.body.textarea;

        //json obj
        var postObj = {
            title: req.body.title,
            mainText: req.body.textarea,
            submitDate: Date.now(),
            editDate: "",
            graphs: "",
            sn1: req.body.sn1,
            sn2: req.body.sn2,
            sn3: req.body.sn3,
            sn4: req.body.sn4,
            sn5: req.body.sn5
        }
        var jsonObj = JSON.stringify(postObj);
      
        var filepath =  currentDirectory + 'blog-posts/' + title;

        fs.writeFileSync(filepath, jsonObj);


    } else {
        console.log("[405] " + req.method + " to " + req.url);
        res.writeHead(405, "Method not supported", {'Content-Type': 'text/html'});
        res.end('<html><head><title>405 - Method not supported</title></head><body><h1>Method not supported.</h1></body></html>');
    }
 });

app.get('/index.html',function(req,res){
    // read the html file
    // and spit them into the response
    fs.readFile(currentDirectory + 'index.html', 'utf8', function (err,data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('Ooops ' + 'index.html' + ' couldnt be found!');
            return console.log(err);
        }
        
        var type =  getFileExtension('index.html');
        res.writeHead(200, {'Content-Type': 'text/' + type});
        res.end(data);
    });
});




app.get('/about', function (req, res){
    fs.readFile(currentDirectory + '/templates/about.html', 'utf8', function (err,data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('Ooops ' + 'about.html' + ' couldnt be found!');
            return console.log(err);
        }
        
        var type =  getFileExtension('about.html');
        res.writeHead(200, {'Content-Type': 'text/' + type});
        res.end(data);
    });
});


app.post('/preview/',function(req,res){

    var jsonString = req.body;
    var theObject = { "title":req.body.title , "textarea":req.body.textarea };
    theObject.title = markdown.toHTML(theObject.title);
    theObject.textarea = markdown.toHTML(theObject.textarea);
    

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(theObject));

});

app.get('/edit',function(req,res){
    fs.readFile(currentDirectory + 'templates/edit.html', 'utf8', function(err, template) {
        if (err) console.log(err);
           
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(template);
    });
});


/*============================

			HOME 	

==============================*/

app.get('/', function (req, res){



        console.log(currentDirectory + 'css' + req.path);
    if (req.path.indexOf('.css') !== -1)
    {
    
        
    }
    else
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
                
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(html);
            });
        });
	}
});



app.get('/*',function(req,res){
    // read the html file
    // and spit them into the response
  
  if(res.req.url == "/abcd"){
    console.log("oh shit");
  }
    fs.readFile(currentDirectory + req.url, 'utf8', function (err,data) {
    if (err) {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end('Ooops ' + req.url + ' couldnt be found!');
        return console.log(err);
    }
    
    var type =  getFileExtension(req.url);
    
    res.writeHead(200, {'Content-Type': 'text/' + type});
    res.end(data);
});


// console.log(req);

});




var server = app.listen(3000, function () {

	var host = server.address().address;
  	var port = server.address().port;

 	console.log('Example app listening at http://%s:%s', host, port)

});


var doesBlogPostExist = function(postName){
    var postExists = false;
    var blogPostsFolder = currentDirectory + 'blog-posts/'; 

    var files = fs.readdirSync(blogPostsFolder);

    for(var blogPostIndex in files){
        if(files[blogPostIndex] == postName){
            postExists = true;
            break;
        }
    }     

    return postExists;
};

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



function getDateString(UNIX_timestamp){
    var dateObj = new Date(UNIX_timestamp);
    date = dateObj.toUTCString();
    var n = date.indexOf(dateObj.getFullYear());
    var date = date.substring(0,n+4);
    return date;
}