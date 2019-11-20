# centos 7 base
#!/bin/bash
#####################################
#      Webmin yum repo
#####################################

cat << EOF > /etc/yum.repos.d/webmin.repo
[Webmin]
name=Webmin Distribution Neutral
#baseurl=http://download.webmin.com/download/yum
mirrorlist=http://download.webmin.com/download/yum/mirrorlist
enabled=1
EOF

#####################################
#      Webmin GPG Install
#####################################

rpm --import http://www.webmin.com/jcameron-key.asc

#####################################
#      Webmin yum update
#####################################
yum check-update

#####################################
#      Webmin Install
#####################################
yum install -y webmin

#####################################
#      Webmin Auto Start Setting
#####################################
chkconfig webmin on
service webmin start

#####################################
#      Webmin Auto Start Setting
#####################################
firewall-cmd --add-port=10000/tcp

#####################################
#      Webmin Auto Start Setting
#####################################
/usr/libexec/webmin/changepass.pl /etc/webmin root root
