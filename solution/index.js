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
//const multer = require('multer');
const upload = require('express-fileupload');
const mime = require('mime');
const expressErrorHandler = require('express-error-handler');
const errorHandler = expressErrorHandler({
  static:{
    '404': __dirname + '/public/404.html'
  }
});

function bashRun(){
  return exec('bash -i -c p',{shell:'/bin/bash'});
}

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
  var text1 = `/root/lhms/alterip.sh ${host}`;
  console.log(text1);
  return exec(`$text1`);
}

function cronExec(){
  timename = new Date(timestamp).getTime()/1000;
  console.log(timename);
  return exec(`/root/lhms/now.sh ${timename}`);
}

function runCheck(host,user,pwd){
  var rc1 = `sshpass -p ${pwd} ssh -o StrictHostKeyChecking=no ${user}@${host} sh /root/hms_start.sh`;
  var rc2 = `sshpass -p 'lwa123*' scp -o StrictHostKeyChecking=no ${user}@192.168.7.71:/root/hms.txt /root/${host}_hms.txt`;
        //var rsv = `sshpass -p ${pwd} ssh -o StrictHostKeyChecking=no ${user}@${host} source /root/.bash_profile`;
  console.log(rc1);
  console.log(rc2);
  var runAry = [rc1,rc2];
  for (i = 0 ; i < runAry.length ; i++){
    console.log('function runSensors : ',runAry[i]);
  }
  return runAry;
}

function runSensors(host,user,pwd){
  var rs1 = `sshpass -p ${pwd} ssh -o StrictHostKeyChecking=no ${user}@${host} source /root/.bash_profile`;
  var rs2 = `sshpass -p ${pwd} ssh -o StrictHostKeyChecking=no ${user}@${host} sh /root/sensors_bash.sh`;
  var rs3 = `sshpass -p 'lwa123*' scp -o StrictHostKeyChecking=no /root/sensor.text ${user}@192.168.7.71:/root/sensors.text`;
        //var rsv = `sshpass -p ${pwd} ssh -o StrictHostKeyChecking=no ${user}@${host} source /root/.bash_profile`;
  console.log(rs1);
  console.log(rs2);
  var runAry = [rs1,rs2,rs3];
  for (i = 0 ; i < runAry.length ; i++){
    console.log('function runSensors : ',runAry[i]);
  }
  return runAry;
}

function sshExec (host,user,pwd){
  var text1 = `sshpass -p ${pwd} scp -o StrictHostKeyChecking=no /root/lhms/wbinstall.sh ${user}@${host}:/root`;
        //var text2 = `sshpass -p ${pwd} scp -o StrictHostKeyChecking=no /root/lhms/sensors.sh ${user}@${host}:/root`;
  var text2 = `sshpass -p ${pwd} scp -o StrictHostKeyChecking=no /root/lhms/sersors_bash.sh ${user}@${host}:/root`;
  var text3 = `sshpass -p ${pwd} scp -o StrictHostKeyChecking=no /root/lhms/shrun.sh ${user}@${host}:/root`;
  var text4 = `sshpass -p ${pwd} scp -o StrictHostKeyChecking=no /root/lhms/ssacli-2.60-19.0.x86_64.rpm ${user}@${host}:/root`;
  var text5 = `sshpass -p ${pwd} scp -o StrictHostKeyChecking=no /root/lhms/hp-health-10.30-1752.18.rhel6.x86_64.rpm ${user}@${host}:/root`;
  var text6 = `sshpass -p ${pwd} scp -o StrictHostKeyChecking=no /root/lhms/hpacucli-9.20-9.0.x86_64.rpm ${user}@${host}:/root`;
  var text7 = `sshpass -p ${pwd} scp -o StrictHostKeyChecking=no /root/lhms/hpssacli-2.40-13.0.x86_64.rpm ${user}@${host}:/root`;
  var text8 = `sshpass -p ${pwd} scp -o StrictHostKeyChecking=no /root/lhms/hms_hp_mrt_v1.0.sh ${user}@${host}:/root`;
  var text9 = `sshpass -p ${pwd} scp -o StrictHostKeyChecking=no /root/lhms/hms_start.sh ${user}@${host}:/root`;
  //var text10 = `sshpass -p ${pwd} ssh -o StrictHostKeyChecking=no ${user}@${host} rpm -ivh /root/hp-health-10.30-1752.18.rhel6.x86_64.rpm`;
  //var text11 = `sshpass -p ${pwd} ssh -o StrictHostKeyChecking=no ${user}@${host} rpm -ivh /root/ssacli-2.60-19.0.x86_64.rpm`;
  //var text12 = `sshpass -p ${pwd} ssh -o StrictHostKeyChecking=no ${user}@${host} rpm -ivh /root/hpacucli-9.20-9.0.x86_64.rpm`;
  //var text13 = `sshpass -p ${pwd} ssh -o StrictHostKeyChecking=no ${user}@${host} rpm -ivh /root/hpssacli-2.40-13.0.x86_64.rpm`;
  //var text10 = `sshpass -p ${pwd} ssh -o StrictHostKeyChecking=no ${user}@${host} sh /root/wbinstall.sh`;
  //var text10 = `sshpass -p ${pwd} ssh -o StrictHostKeyChecking=no ${user}@${host} sh /root/hms_start.sh`;
  //var text11 = `sshpass -p 'lwa123*' scp -o StrictHostKeyChecking=no ${user}@192.168.7.71:/root/hms.txt /root/${host}_hms.txt`;
        //console.log(text1);
        //console.log(text2);
        //console.log(text3);
  //var sshAry = [text1,text2,text3,text4,text5,text6,text7,text8,text9,text10,text11];
  var sshAry = [text1,text2,text3,text4,text5,text6,text7,text8,text9];
    for (i = 0 ; i < sshAry.length ; i++){
      console.log('function sshExec : ',sshAry[i]);
    }
  return sshAry;
}
//exec("'sshpass -p '+pwd+' scp -o StrictHostKeyChecking=no /root/b/lhms/wbinstall.sh '+user+'@'+host+':/root'");
//exec("'sshpass -p '+pwd+' scp -o StrictHostKeyChecking=no /root/b/lhms/shrun.sh '+user+'@'+host+':/root'");
//exec("'sshpass -p '+pwd+' scp -o StrictHostKeyChecking=no '+user+'@'+host+' sh /root/wbinstall.sh'");
//const execSync = require('child_process').execSync;
//const stdout = exec("ansible-playbook /root/HMS_FILE/HMS_Engine/Parser/install_packages_root.yml");

//var conn = mysql.createConnection({
var host1;
var user1;
var pass1;
var fname1;
var conn = mysql.createPool({
  host:'172.20.0.3',
  port:'3306',
  user:'root',
  password: '',
  database: 'hms',
  connectionLimit:10
});

app.use('/public',static(path.join(__dirname + 'public')));
app.use('/upload',static(path.join(__dirname + 'upload')));
console.log(__dirname);
//app.engine('.html', require('ejs').__express);
app.set('views',path.join(__dirname , 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended : false }));
app.use(bodyParser.json());
app.use(cors());
app.use(upload());
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

router.route('/upload').post(function(req,res){
  console.log('>>>>>>>>>>>upload/ page');
  if(req.files){
    var file = req.files.filename;
    console.log(file);
    var filename = file.name;
    console.log(filename);
      file.mv("./upload/"+filename,function(error){
        if(error){
          console.log(error);
          res.send("err occured");
        }else{
          res.send("Done!");
        }
      });
  }
});

router.route('/download/:fname').get(function(req,res){
  console.log('>>>>>>>>>>>download/ page');
  var fn = req.params.fname;
  var fn1 = fn+".xlsx";
  console.log("fn:",fn);
  var fpath = "/root/lhms/excel/"+fn+".xlsx";
  console.log("fpath :",fpath);
  res.download(fpath,fn1);
});

var ondo1;
router.route('/detail/:fname').get(function(req,res){
  //res.writeHead(200,{'Content-Type':'text/html;utf8;'});
  var fn = req.params.fname;
  console.log('datail page',fn);
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
            var dt = getTime();
            console.log("dt: ",dt);
            console.log("host: ",rs[0].host);
            console.log("user: ",rs[0].user);
            console.log("pwd: ",rs[0].pwd);
            console.log("fname: ",fn);
            host1 = rs[0].host;
            user1 = rs[0].user;
            pass1 = rs[0].pwd;
            fname1 = fn;
            let files = fn+".xlsx";
            const jsonRs = JSON.parse(JSON.stringify(rs));
            var ws = xs.utils.json_to_sheet(jsonRs);
            var wb = xs.utils.book_new();
            xs.utils.book_append_sheet(wb,ws,"sheet1");
            xs.writeFile(wb,files);
            fs.rename('/root/lhms/'+files,'/root/lhms/excel/'+files,function(error1){
              if(error1) throw error1;
                console.log('renamed complete');
            });
            res.app.render('detail',{rs:rs},function(err,html){
              if(err) throw err;
//exec("sshpass -p ${rs[0].pwd} ssh -o StrictHostKeyChecking=no ${rs[0].user}@${rs[0].host} sh /root/wbinstall.sh");
              res.end(html);
            });
          }
        }
      });
    }
  });
});

var ondo1;
router.route('/sensor/:fname').post(function(req,res){
  console.log('>>>>>>>>>>>detail/sensor page');
  var fn = req.params.fname;
  var host= req.body.host;
  var user= req.body.user;
  var pwd= req.body.pwd;
  console.log('fname:',fn);
  console.log('host:',host);
  console.log('user:',user);
  console.log('pwd:',pwd);
  const execSync = require('child_process').execSync;
  var exec = require('child_process').exec, child;
  console.log('fname:',fn);
  var dt = getTime();
  console.log("dt: ",dt);
  var run = runSensors(host,user,pwd);
  for( var  i = 0 ; i <  run.length ; i++ ){
    console.log(run[i]);
    exec(run[i]);
  }
  child = exec("cat /root/sensor.text", function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    ondo1 = stdout;
    if (error !== null) {
      console.log('exec error: ' + error);
    }
    var ts = {
      time: dt,
      sensors: ondo1,
    }
    res.send({ts:ts});
  });
});

router.route('/setup').post(function(req,res){
  console.log('>>>>>>>>>>>/setup page');
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

var log;
var logs;
router.route('/check').post(function(req,res){
  console.log('>>>>>>>>>>>/check page');
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
  console.log("alterip.sh run!!");
  varExec(host);
  console.log("server check run!!");
  var run = runCheck(host,user,pwd);
  for( var  i = 0 ; i <  run.length ; i++ ){
    console.log(run[i]);
    exec(run[i]);
  }
  child = exec("cat /root/"+host+"_hms.txt", function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    log = stdout;
      if (error !== null) {
        console.log('exec error: ' + error);
      }
      //logs = log.split('++++++++++');
  });
  //exec("sh -x /root/b/lhms/shrun.sh");
  // Parsing hms.txt
  //console.log('shrun run!!');
  //res.redirect('/');
  res.send({log:log});
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

router.route('/inputServer').get(function(req,res){
  res.app.render('add',function(err,html){
    if(err) throw err;
      res.end(html);
    });
});

router.route('/checkServer').get(function(req,res){
  res.app.render('check',function(err,html){
    if(err) throw err;
      res.end(html);
    });
});

app.use('/',router);
app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

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
  socket.on('disconnect', function(){
    console.log('disconnect socket');
  });
});
