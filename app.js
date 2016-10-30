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



app.get('/blog.css',function(req,res){
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
        fs.readFile(currentDirectory + 'templates/entry', 'utf8', function(err, template) {
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.end('Ooops ' + req.url + ' couldnt be found!');
                return console.log(err);
            }
            var blogFileName = blogPostsFolder + getFileName(req.url);
            fs.readFile(blogFileName, 'utf8', function(err, postMarkUp) {            


                var jsonString = JSON.parse(postMarkUp);
                var post = markDownToHTMLwithCodeFormatting(jsonString.mainText);
            
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
                html = html.replace('{{Title}}', (jsonString.title).stripDashes());
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
      //  title = title.replace(/ /g,"-");
        title = titleToPath(title);
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

app.get('/books', function (req, res){
    fs.readFile(currentDirectory + '/templates/books.html', 'utf8', function (err,data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('Ooops ' + 'books.html' + ' couldnt be found!');
            return console.log(err);
        }
        
        var type =  getFileExtension('books.html');
        res.writeHead(200, {'Content-Type': 'text/' + type});
        res.end(data);
    });
});

app.post('/preview/',function(req,res){

    var jsonString = req.body;
    var theObject = { "title":req.body.title , "textarea":req.body.textarea };
    


    theObject.title = markdown.toHTML(theObject.title);
//    theObject.textarea = markdown.toHTML(theObject.textarea);
    theObject.textarea = markDownToHTMLwithCodeFormatting(theObject.textarea);
    

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(theObject));

});


/*============================

			HOME 	

==============================*/

app.get('/', function (req, res){
    if (req.path.indexOf('.css') !== -1)
    {
    
        
    }
    else
    {
	 	var blogPostsFolder = currentDirectory + 'blog-posts/';
        
        var files = fs.readdirSync(blogPostsFolder);

        var orderedFiles = [];
        for(var x = 0; x < files.length; x++){
            var postTitle = files[x];
            var blogPostFile = fs.readFileSync(currentDirectory + '/blog-posts/' + postTitle);
            orderedFiles[x] = JSON.parse(blogPostFile);
        }
        orderedFiles.sort(sortByDate);
    
        // read in our home template
        var templateString = fs.readFileSync(currentDirectory + 'templates/home');            

        templateString = '' + templateString;

        var blogPosts = '';
        
        orderedFiles.forEach(function(blogPostObj) {
            var htmlForPosts = templateString.getTextBetweenTokens("{{REPEAT}}", "{{ENDREPEAT}}");

            htmlForPosts = htmlForPosts.replace('{{Post1.Link}}', '/post/' + (titleToPath(blogPostObj.title)));
            htmlForPosts = htmlForPosts.replace('{{Post1.Title}}', blogPostObj.title);
            blogPosts += htmlForPosts;
        });
     
        
        orderedFiles.forEach(function(blogPostObj) {
            var blurb = "";              
            var postlink = "<a id='postlink' href=" + '/post/' + (titleToPath(blogPostObj.title)) +  ">Read more »</a>";
            blurb = '' + blogPostObj.mainText.substring(0,300) + "...";
            blogPosts = blogPosts.replace('{{Post1.Blurb}}', blurb + "<br>" + postlink);
        });

        var html = templateString.replace('{{Title}}', "Tadhg's page. Software, Math and Literature.")
                                 .replaceContents("{{REPEAT}}", "{{ENDREPEAT}}", blogPosts);
        
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(html);
    
    
	}
});



app.get('/*',function(req,res){

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

String.prototype.stripDashes = function() {
    var temp = this.replace("---","{temp}");
    var temp2 = temp.replace(/-/g," ");
    var temp3 = temp2.replace("{temp}"," - ");
    return temp3;
}


 var markDownToHTMLwithCodeFormatting = function(postContents) {
    var codeBlocks = [];
    
    var i = 0;
    while(postContents.indexOf("{{code}}") > -1 && postContents.indexOf("{{/code}}") > -1){
        var startBlockPos = postContents.indexOf("{{code}}") + 8;
        var endBlockPos = postContents.indexOf("{{/code}}") - 1;

        var codeblock = postContents.substring(startBlockPos, endBlockPos);
        postContents = postContents.replace(codeblock, "");
        postContents = postContents.replace("{{code}}" , "{{c" + i +"}}");
        postContents = postContents.replace("{{/code}}" , "{{/c" + i +"}}");
        codeBlocks[i] = codeblock;
        i++;
    }
    
    var postContentsWithMarkup = markdown.toHTML(postContents);
    
    for(var j = 0; j < codeBlocks.length; j++){
        
        var codeBlockToInsert = codeBlocks[j];
        codeBlockToInsert = codeBlockToInsert.replace(/</g, "&lt;");
        codeBlockToInsert = codeBlockToInsert.replace(/>/g, "&gt;");
        var formattedCodeBlockToInsert = "<pre><code>" + codeBlockToInsert + "</code></pre></br>";
        
        postContentsWithMarkup = postContentsWithMarkup.replace("{{c" + j +"}}", formattedCodeBlockToInsert);
        postContentsWithMarkup = postContentsWithMarkup.replace("{{/c" + j +"}}", "");
    }

    return postContentsWithMarkup;
}


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

var titleToPath = function(postTitle){
    return postTitle.replace(/ /g,"-");
}


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

function sortByDate(a,b) {
  if (a.submitDate > b.submitDate)
    return -1;
  if (a.submitDate < b.submitDate)
    return 1;
  return 0;
}
