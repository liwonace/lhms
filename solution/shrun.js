function exec (cmd){
	return require('child_process').execSync(cmd).toString().trim()
}
const execSync = require('child_process').execSync;
const host = "192.168.7.70"
const ip = exec("cat /root/HMS_FILE/HMS_Engine/Parser/install_packages_root.yml | grep -E -o '([0-9]{1,3}[\.]){3}[0-9]{1,3}'");
//shell cal
exec("/root/b/lhms/alterip.sh"+" "+ip+" "+host);
const stdout = exec("ansible-playbook /root/HMS_FILE/HMS_Engine/Parser/install_packages_root.yml");
console.log(`stdout: ${stdout}`);
