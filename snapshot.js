var sys = require("util");
var exec = require('child_process').exec;    

exports.capture = function (url,dir,file,callback){
    // 调用shell生成图片
    var cmdstring = "mkdir -p " + dir +"  && time DISPLAY=':1.0'  CutyCapt --min-width=980 --min-height=1600 --max-wait=5000 --java=off --url=" + url + " --out=" + file + " && mogrify " + file +  " -crop 980x2000+0+0 -resize 40%x40% " + file;
    sys.print("exe command: " + cmdstring + "\n");
    // executes `pwd`

    // 执行进程的选项
    var options = { encoding: 'utf8'
                  , timeout: 6000
		  , killSignal: 'SIGTERM'
		 };
    var child = exec(cmdstring,options, function (error, stdout, stderr) {
      sys.print('stdout: ' + stdout);
      sys.print('stderr: ' + stderr);
      if (error !== null) {
         console.log('exec error: ' + error);
         child.kill('SIGTERM');
      }else{
         callback(url, file);
      }
    });
};
