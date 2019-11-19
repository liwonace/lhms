cnt=`cat /root/.bash_profile | grep -i sensors | wc -l`
if [ $cnt -ne 1 ]; then
cat << EOF >> /root/.bash_profile
alias s='sensors | grep '+' | grep -i 'locl*' | sed -r "s/^.*: +(.*) +[(].*$/\1/"'
EOF

cat << EOF >> /root/.bashrc
alias s='sensors | grep '+' | grep -i 'locl*' | sed -r "s/^.*: +(.*) +[(].*$/\1/"'
EOF
fi
source /root/.bash_profile
source /root/.bashrc

rs=`bash -i -c s`
echo $rs > /root/sensor.text
