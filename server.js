var path = require('path');
var http = require('http');
var fs = require('fs');
var cluster = require('cluster');
var app = require('./app');

var NODE_ENV = process.env.NODE_ENV || 'production';
var appName = path.basename(__dirname);
var appPort = 9000;


var numCPUs = require('os').cpus().length;

//process.setuid("snapshot");
if (cluster.isMaster) {
    
    process.title = appName + ' master';
    console.log(process.title, 'started');

    var workers = [];

    // 根据 CPU 个数来启动相应数量的 worker
    for (var i = 0; i < numCPUs; i++) {
        var worker = cluster.fork();
        workers.push(worker.pid);
    }

    process.on('SIGHUP', function() {
        // master 进程忽略 SIGHUP 信号
    });

    // 监测文件改动，如果有修改，就将所有的 worker kill 掉
    fs.watch(__dirname, function(event, filename) {
        // 如果js改变才重启
        if(path.extname(filename) == ".js"){
            workers.forEach(function(pid) {
                process.kill(pid);
            });
        }
    });

    cluster.on('death', function(worker) {
        var index = workers.indexOf(worker.pid);
        if (index != -1) {
            workers.splice(index, 1);
        }
        console.log(appName, 'worker', '#' + worker.pid, 'died');
        worker = cluster.fork();
        workers.push(worker.pid);
    });

} else {
    process.title = appName + ' worker ' + process.env.NODE_WORKER_ID;
    console.log(process.title, '#' + process.pid, 'started');

    process.on('SIGHUP', function() {
        // 接收到 SIGHUP 信号时，关闭 worker
        process.exit(0);
    });

    // 启动应用app
    app.start();
    
    // 如何用forever 实现一直运行服务端程序
    /**
    http.Server(function(req, res) {
        res.writeHead(200);
        res.end('Worker ' + process.env.NODE_WORKER_ID);
    }).listen(8000);
    **/
}
