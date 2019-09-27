var express = require('express');
const ejs = require('ejs');
const https = require('https');
const url = require('url');
var app = express();
var fs = require('fs');
var mysql = require('mysql');
var path = require('path');
var bodyParser = require('body-parser');
const router = express.Router();
const cors = require('cors');
const static = require('serve-static');
const xs = require('xlsx');
const shell = require('shelljs');
const socketio = require('socket.io');
const net = require('net');
const { setInterval } = require('timers');
const date = require('date-utils');
//const dt = newDate.toFormat('HH24:MI:SS');
//const jsdom = require('jsdom');
//const {JSDOM} = jsdom;
//const {window} = new JSDOM();
//const {document} = (new JSDOM('')).window;
//global.document = document;
//var $ = jQuery = require('jquery')(window);
//$(window).on('beforeunload', function(){
//      console.log('refresh run !!');
//      exec('bash -i -c p',{shell:'/bin/bash'});
//});
//    console.log('refresh run!!');
//    exec('bash -i -c p',{shell:'/bin/bash'});

function bashRun(){
        return exec('bash -i -c p',{shell:'/bin/bash'});
}

//bashRun(function(err,rs1){
//      if(err) throw err;
//      console.log('bash shell run!');
//      console.log(rs1);
//});
function getTime(){
        const newDate = new Date();
        timename = newDate.toFormat('HH24:MI:SS');
        console.log(timename);
        return timename;
}

function exec (cmd){
        return require('child_process').execSync(cmd).toString().trim()
}

function varExec (host){
        var text1 = `/root/b/lhms/alterip.sh ${host}`;
        console.log(text1);
        return exec(`$text1`);
}

function cronExec(){
        timename = new Date(timestamp).getTime()/1000;
        console.log(timename);
        return exec(`/root/b/lhms/now.sh ${timename}`);
}

function sshExec (host,user,pwd){
        var text1 = `sshpass -p ${pwd} scp -o StrictHostKeyChecking=no /root/b/lhms/wbinstall.sh ${user}@192.168.7.71:/root`;
        var text2 = `sshpass -p ${pwd} scp -o StrictHostKeyChecking=no /root/b/lhms/shrun.sh ${user}@192.168.7.71:/root`;
        var text3 = `sshpass -p ${pwd} scp -o StrictHostKeyChecking=no /root/b/lhms/wbinstall.sh ${user}@${host}:/root`;
        var text4 = `sshpass -p ${pwd} scp -o StrictHostKeyChecking=no /root/b/lhms/shrun.sh ${user}@${host}:/root`;
        var text5 = `sshpass -p ${pwd} ssh -o StrictHostKeyChecking=no ${user}@${host} sh /root/wbinstall.sh`;
        console.log(text1);
        console.log(text2);
        console.log(text3);
        var sshAry = [text1,text2,text3,text4,text5];
        for (i = 0 ; i < sshAry.length ; i++){
                console.log(sshAry[i]);
        }
        return sshAry;
}
//exec("'sshpass -p '+pwd+' scp -o StrictHostKeyChecking=no /root/b/lhms/wbinstall.sh '+user+'@'+host+':/root'");
//exec("'sshpass -p '+pwd+' scp -o StrictHostKeyChecking=no /root/b/lhms/shrun.sh '+user+'@'+host+':/root'");
//exec("'sshpass -p '+pwd+' scp -o StrictHostKeyChecking=no '+user+'@'+host+' sh /root/wbinstall.sh'");
//const execSync = require('child_process').execSync;
//const stdout = exec("ansible-playbook /root/HMS_FILE/HMS_Engine/Parser/install_packages_root.yml");

//var conn = mysql.createConnection({
var conn = mysql.createPool({
        host:'172.20.0.3',
        port:'3306',
        user:'root',
        password: '',
        database: 'hms',
        connectionLimit:10
});

app.use('/public',static(path.join(__dirname + 'public')));
//app.engine('.html', require('ejs').__express);
app.set('views',path.join(__dirname , 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());

app.use(cors());
//app.listen(3000,function(){
//      console.log('Server Start');
//});

app.get('/',function(req,res){
        fs.readFile('./views/index.ejs','utf8',function(errors,data){
        conn.getConnection(function(err, con){
        if(err){
                throw err;
                con.release();
        }else{
        con.query('select * from tests', function(error,rs){
                if (error){
                   console.log(error);
                   res.status(500).send('Internal Server Error');
                   con.release();
                }else{
                   if(rs.length === 0){
                   console.log('there is no record');
                   con.release();
                   res.send(ejs.render(data, {rs:rs}));
                   }else{
                   res.send(ejs.render(data, {rs:rs}));
                   }
                }
           });
        }
      });
   });
});

router.route('/detail/:fname').get(function(req,res){
        //res.writeHead(200,{'Content-Type':'text/html;utf8;'});
        const fn = req.params.fname;
        conn.getConnection(function(err, con){
                 if(err){
                        throw err;
                        con.release();
                }else{
                        con.query("select * from tests where ?",fn, function(error,rs,fields){
                        if (error){
                                        console.log(error);
                                        res.status(500).send('Internal Server Error');
                                        con.release();
                                }else{
                                        if(rs.length === 0){
                                        console.log('there is no record');
                                        con.release();
                                        res.app.render('detail',{rs:rs},function(err,html){
                                        if(err) throw err;
                                        res.end(html);
                                        });
                                        }else{
                                                var ts = {
                                                        fname : rs[0].fname,
                                                        host: rs[0].host,
                                                        user: rs[0].user,
                                                        pwd: rs[0].pwd,
                                                        inputdt: rs[0].inputdt,
                                                        updatedt: rs[0].updatedt,
                                                        log: rs[0].log,
                                                        status: rs[0].status
                                                }
                                                const jsonRs = JSON.parse(JSON.stringify(rs));
                                                console.log(ts);
                                                var ws = xs.utils.json_to_sheet(jsonRs);
                                                var wb = xs.utils.book_new();
                                                xs.utils.book_append_sheet(wb,ws,"sheet1");
                                                xs.writeFile(wb,"text1.xlsx");
                                                res.app.render('detail',{rs:rs},function(err,html){
                                                if(err) throw err;
                                                res.end(html);
                                                });
                                        }

                                }
                        });
                }
        });
});
router.route('/setup').post(function(req,res){
        var host = req.body.host;
        var user = req.body.user;
        var pwd = req.body.pwd;
        // state NOT R
        const execSync = require('child_process').execSync;
        //docker cp e4f3b1457ccf:/root/b/lhms/shrun.sh /root || docker cp e4f3b1457ccf:/root/b/lhms/wbinstall.sh /root <- file cp : docker out /root
        var sshAry = sshExec(host,user,pwd);
        for( var  i = 0 ; i <  sshAry.length ; i++ ){
                console.log(sshAry[i]);
                exec(sshAry[i]);
        }
        //exec("'sshpass -p '+pwd+' scp -o StrictHostKeyChecking=no /root/b/lhms/wbinstall.sh '+user+'@'+host+':/root'");
        //exec("'sshpass -p '+pwd+' scp -o StrictHostKeyChecking=no /root/b/lhms/shrun.sh '+user+'@'+host+':/root'");
        //exec("'sshpass -p '+pwd+' scp -o StrictHostKeyChecking=no '+user+'@'+host+' sh /root/wbinstall.sh'");
        console.log('ssh run!!');
        res.redirect('/');
});

router.route('/check').post(function(req,res){
        var host = req.body.host;
        var user = req.body.user;
        var pwd = req.body.pwd;
        var fname = req.body.fname;

        console.log(host);
        console.log(user);
        console.log(pwd);
        // state NOT R
        const execSync = require('child_process').execSync;
        var exec = require('child_process').exec, child;
        varExec(host);
        console.log("alterip.sh run!!");
        child = exec("bash -i -c an", function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                console.log('exec error: ' + error);
                }
        });
        //exec("sh -x /root/b/lhms/shrun.sh");
        console.log('shrun run!!');
        res.redirect('/');
});

router.route('/refresh').get(function(req,res){
        const execSync = require('child_process').execSync;
        var exec = require('child_process').exec, child;
        exec("bash -i -c p", function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                console.log('exec error: ' + error);
                }
                console.log('server list refresh run!!');
                res.redirect('/');
        });
});

app.use('/',router);

var servers = https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: 'lwa123*'
}, app).listen(3000);

var io = socketio.listen(servers);
io.sockets.on('connection',function(socket){
        console.log('socket connect');
        const execSync = require('child_process').execSync;
        var exec = require('child_process').exec;
        function retry(){
                //var dt = newDate.toFormat('HH24:MI:SS');
                var dt = getTime();
                console.log("dt: ",dt);
                exec("bash -i -c s", function (error, stdout, stderr) {
                        var sensor = {
                                time: dt,
                                sensors: stdout
                        }
                        console.log('stdout: ' + stdout);
                        console.log('stderr: ' + stderr);
                        var sensors = JSON.stringify(sensor);
                        socket.emit('stdout',sensors);
                        if (error !== null) {
                        console.log('exec error: ' + error);
                        }
                });
        };
        setInterval(retry,30000);
});
