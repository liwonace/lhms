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
require('dotenv').config();
const expressErrorHandler = require('express-error-handler');
const errorHandler = expressErrorHandler({
  static:{
    '404': __dirname + '/public/404.html'
  }
});

function getTime(){
  const newDate = new Date();
  timename = newDate.toFormat('HH24:MI:SS');
  console.log(timename);
  return timename;
}

function exec (cmd){
  return require('child_process').execSync(cmd).toString().trim()
}

function runSensors(host,user,pwd){
  var rs1 = `sshpass -p ${pwd} ssh -o StrictHostKeyChecking=no ${user}@${host} source /root/.bash_profile`;
  var rs2 = `sshpass -p ${pwd} ssh -o StrictHostKeyChecking=no ${user}@${host} sh /root/sensors_bash.sh`;
  var rs3 = `sshpass -p process.env.OS_PASS scp -o StrictHostKeyChecking=no /root/sensor.text ${user}@process.env.OS_HOST:root/sensors.text`;
        //var rsv = `sshpass -p ${pwd} ssh -o StrictHostKeyChecking=no ${user}@${host} source /root/.bash_profile`;
  console.log(rs1);
  console.log(rs2);
  var runAry = [rs1,rs2,rs3];
  for (i = 0 ; i < runAry.length ; i++){
    console.log('function runSensors : ',runAry[i]);
  }
  return runAry;
}

var host1;
var user1;
var pass1;
var fname1;
var conn = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
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
         con.query('select * from hosts', function(error,rs){
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

app.use('/',router);
app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

var servers = https.createServer({
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
  passphrase: process.env.OS_PASS
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
