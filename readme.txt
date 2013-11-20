启动snapshot
cd /home/httpd/html/snapshot/webapps/snapshot
node server.js >> ../../logs/stdout.log &
查看日志
tail -f /home/httpd/html/snapshot/logs/stdout.log 
批量杀死截图卡死进程 CutyCapt
pkill CutyCapt
查看当前运行中的snapshot 进程 
ps aux|grep snapshot

