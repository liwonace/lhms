#!/bin/bash
bip=`cat /root/HMS_FILE/HMS_Engine/Parser/install_packages_root.yml | grep -E -o '([0-9]{1,3}[\.]){3}[0-9]{1,3}'`
echo "$bip"
aip=$1
echo "$aip"
if [ $# -ne 1 ]; then
	echo "you must input 2 parameter"
        exit 1
fi
# add ip in hosts
cnt=`cat /etc/ansible/hosts | grep $1 | wc -l`
if [ $cnt -ne 1 ]; then
echo $1 >> /root/HMS_FILE/HMS_Engine/Parser/hosts
echo $1 >> /etc/ansible/hosts
fi
# Alter ip in Install_packages_root.yml
sed -i 's/'"$bip"'/'"$aip"'/g' /root/HMS_FILE/HMS_Engine/Parser/install_packages_root.yml
#ansible-playbook /root/HMS_FILE/HMS_Engine/Parser/install_packages_root.yml
