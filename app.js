var sys = require("util"),
    http = require("http"),  
    url = require("url"),  
    querystring =  require("querystring"),
    path = require("path"),  
    fs = require("fs"),
    crypto = require('crypto'),
    snapshot = require('./snapshot');

var appName = path.basename(__dirname);
    

function render(response,filename){
    fs.readFile(filename, "binary", function(err, file) {  
        if(err) {  
            response.writeHead(500, {"Content-Type": "text/plain"});  
            response.write(err + "\n");  
            response.end();  
            return;  
        }  

        response.writeHead(200);  
        response.write(file, "binary");  
        response.end();  
    }); 
}


exports.start = function(){
    
    // 设置当前运行的账户为nobody
    //process.setuid('nobody'); 
  
    http.createServer(function(request, response) {  
        //sys.print(querystring.parse(require('url').parse(request.url).query).item);
        //request.addListener('data',function(request,response){
        //    process(request,response);   
        //});
        
        var params = url.parse(request.url,true).query;
        var destUri = params.target;
        var action = params.action;

	var worker_title = appName + ' worker ' + process.env.NODE_WORKER_ID;

        sys.print("[" + worker_title + "] fetch the url: " + destUri + "\n");
        if(!destUri){
            response.writeHead(500, {"Content-Type": "text/plain"});  
            response.write("the params target is null" + "\n");  
            response.end();  
            return;  
        }
    
        //var destUri = "http://news.17173.com";
        var md5sum = crypto.createHash('md5');
        var storekey = md5sum.update(destUri).digest("hex") + ".jpg";   
        // var pwd = process.cwd();
        var storedir = path.join("/home/httpd/html/snapshot/images", storekey.substr(0,1),storekey.substr(1,1));  
        var filename = path.join(storedir, storekey);  
        sys.print("file=" + filename + "\n");
        
        path.exists(filename, function(exists) {  
            if(!exists) {  
                snapshot.capture(destUri,storedir,filename,function(url,file){
                    if(action == "create"){
                        response.writeHead(200);  
                        response.write("create snapshot success!");  
                        response.end();  
                    }else{
                        render(response,file);
                    }
                    return;
                });
    
            }else{
                sys.print("file exist:" + filename + "\n");
                  if(action == "create"){
                        response.writeHead(200);  
                        response.write("create snapshot success!");  
                        response.end();  
                    }else{
                        render(response,filename);
                    }
                sys.print("render end" + "\n");
                return;
            }         
    
        });  
        
        sys.print("file end=" + filename + "\n");
    
    }).listen(8080);  
          
    sys.puts("Server running at http://localhost:8080/");
};

