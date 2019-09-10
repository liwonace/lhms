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

function exec (cmd){
        return require('child_process').execSync(cmd).toString().trim()
}
function varExec (host){
        var text1 = `/root/b/lhms/alterip.sh ${host}`;
	console.log(text1);
	return exec(`$text1`);
}
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
//	console.log('Server Start');
//});
//
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
	exec("'sshpass -p '+pwd+' scp -o StrictHostKeyChecking=no /root/b/lhms/wbinstall.sh '+user+'@'+host+':/root'");
	exec("'sshpass -p '+pwd+' scp -o StrictHostKeyChecking=no /root/b/lhms/shrun.sh '+user+'@'+host+':/root'");
	exec("'sshpass -p '+pwd+' scp -o StrictHostKeyChecking=no '+user+'@'+host+' sh /root/wbinstall.sh'");
        console.log('ssh run!!');
	res.app.render('index',{},function(err,html){
            if(err) throw err;
            res.end(html);
        });
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
	res.redirect('/detail/:fname');
});

app.use('/',router);

https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: 'lwa123*'
}, app)
.listen(3000);
