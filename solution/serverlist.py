#!/usr/bin/python3
import os
import subprocess
import re
import pymysql
from datetime import datetime

strPath = r"/etc/webmin/servers";# file dir
files = os.listdir(strPath)
lists = [];# file lists
host = [];
user = [];
pwd = [];
val = 0;# extractServer use
test = "";# grep host
test1 = "";# grep user
test2 = "";# grep pass
test3 = "";# Text = remove
test5 = "";# Text /n remove
test7 = "";# Text1 ' remove
test9 = "";# Text1 /n remove
#retry = "";# fail use filename show : no use
cnt1 = 0;# array file wc total count
filelenlist = [];# files wc total list
filelentotallist = ""; #files wc total list make word and reset
finallist = []; # after less 11 rows romeve then finally list
lenlist = [];
fcnt = [];# length 11 less count list
frows = 0;# length 11 less count
hs = "";# host
us = "";# user
ps = "";# pass
rows = 0;# file wc -l
row = 0;# file wc -l
count = 0;# total file count for 11 less count
servers = "";
#total = [];# value total  : no use

##########################################################################################
                    # FUNCTION
##########################################################################################

def extractServer(server):
    val = server.index('.')
    result = server[:val]
    return str(result).replace('[]','').replace('[', '').replace(']', '').replace("'",'')
def extractText1(text1):
    #result = re.findall(r'^=[0-9]+(?:\.[0-9]+)', text)
    result = re.findall(r'\d+',str(text1))
    return str(result).replace('[]','').replace('[', '').replace(']', '').replace("'",'')
#def extractFile(file):
#    result = re.search(r'.*[.].*$', file)
#    return str(result).replace('[]','').replace('[', '').replace(']', '').replace("'",'')
def extractIp(ip):
    result = re.findall(r'[0-9]+(?:\.[0-9]+){3}', ip)
    return str(result).replace('[]','').replace('[', '').replace(']', '').replace("'",'')
#regex1 = re.compile(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$')
def extractText(text):
    #result = re.findall(r'^=[0-9]+(?:\.[0-9]+)', text)
    test3 = text.index('=')
    test5 = text.index('\n')
    result = text[test3+1:test5]
    return str(result).replace('[]','').replace('[', '').replace(']', '').replace("'",'')
print("files = %s" % files)
servs = [file for file in files if file.endswith(".serv")]
cnt = 0;
now1 = datetime.now()
now = now1.strftime("%Y")+now1.strftime("%m")+now1.strftime("%d")
print("now = %s" %now);
print("servs = %s" % servs);
print("servs len = %s" % len(servs));
db = pymysql.connect(host='172.20.0.3', port=3306, user='root', passwd='', db='hms',charset='utf8',autocommit=True)
cursor = db.cursor()

##########################################################################################
                    # SERVER LIST PASING & MARIADB INSERT
##########################################################################################

for serve in servs:
    print("===================================================");
    print("start row 11 less count check servs = %s : " % servs);
    print("start row 11 less count check serve = %s : " % serve);
    print("===================================================");
    print("now count = %s :" % count);
    lenlist.append(serve)
    print("all lenlist count = %s :" % lenlist);
    cnt2 = subprocess.check_output('cat /etc/webmin/servers/%s | wc -l' % lenlist[count],shell=True)
    cnt1 = extractText1(cnt2)
    filelenlist.append(cnt1)
    print("now filelenlist = %s :" % filelenlist[count]);
    #print("filelenlist.split() = %s :  " % " ".join(filelenlist[count]));
    #for y in range(filelenlist):
    ##filelenlist[count]
    ##for fll in filelenlist:
    print("filelenlist[%d] = %s :" % (count, filelenlist));
    ##   print("len(filelenlist) = %s :" % len(filelenlist));
        #print("now fll = %s :" % fll);
        #fl = fll.split(",")
    filelentotallist = filelenlist[count]
    print("now filelentotallist = %s :" % filelentotallist);
    if filelentotallist == '11':
        if count < len(servs):
                #count = count + 1;
            print("11 length ! pass ~~");
    else:
        fcnt.append(serve)
        print(" no 11 length find ~~~ add value in fcnt + 1 = %s :" % count);
        if count < len(servs):
                #count = count + 1;
            filelentotallist = "";
    count = count + 1;
    print("===================================================");
    print("end row count = %s :" % count);
    print("fcnt = %s :" % fcnt);
    print("===================================================");
frows = len(fcnt)
print("frows = %s:" % frows);

##########################################################################################
                    # frows : less 11 rows -> craete new array and input filename and remove it
##########################################################################################

for removes in fcnt:
    servs.remove(removes)
print(" alter remove less 11 rows servs = %s :" % servs);

try:
    with cursor:
        sql_d = "DELETE FROM tests"
        cursor.execute(sql_d)
        db.commit()
        for serv in servs:
            lists.append(serv)
            print("-----------------------------------------------------");
            print("lists[cnt] =  %s cnt = %d : " % (lists[cnt], cnt));
            rows = subprocess.check_output('cat /etc/webmin/servers/%s | wc -l' % lists[cnt],shell=True)
            row = extractText1(rows)
            print("-----------------------------------------------------");
            print("row = %s cnt = %d : " % (row, cnt));
            print("-----------------------------------------------------");
            servers = extractServer(serv)
            #total.append(servers)
            print("fname = %s" % servers);
            if row == "11":
                test = subprocess.check_output('cat /etc/webmin/servers/%s | grep host' % lists[cnt],shell=True)
                test1 = subprocess.check_output('cat /etc/webmin/servers/%s | grep user' % lists[cnt],shell=True)
                test2 = subprocess.check_output('cat /etc/webmin/servers/%s | grep pass' % lists[cnt],shell=True)
                hs = extractIp(test.decode('utf-8'))
                host.append(hs)
                print("host =%s" % host[cnt]);
                print("host[%d] =%s" % (cnt,host[cnt]));
                #total.append(hs)
                us = extractText(test1.decode('utf-8'))
                user.append(us)
                print("user =%s" % user[cnt]);
                print("user[%d] =%s" % (cnt,user[cnt]));
                #total.append(us)
                ps = extractText(test2.decode('utf-8'))
                pwd.append(ps)
                print("pwd =%s" %pwd[cnt]);
                print("pwd[%d] =%s" % (cnt,pwd[cnt]));
                #total.append(ps)
                #cursor.execute("INSERT INTO tests(fname,host,user,pwd,inputdt) VALUES (%s,%s,%s,%s,%s)" % (servers,host[cnt],user[cnt],pwd[cnt],now))
                sql = "INSERT INTO `tests` (`fname`,`host`,`user`,`pwd`,`inputdt`) VALUES (%s,%s,%s,%s,%s)"
                #for i in servs:
                cursor.execute(sql, (servers,host[cnt],user[cnt],pwd[cnt],now))
                data = cursor.fetchall()
                db.commit()
                if cnt < len(servs):
                    cnt = cnt+1;
            else:
                #print("cnt = %d:" % cnt);
                #retry = servs[cnt]
                #print("retry =  %s : " % retry);
                #if cnt < len(servs)-1:
                #    cnt = cnt;
                #    print("cnt = %d , cnt < len(servs):" % cnt);
                #    print("lists[cnt] =  %s cnt = %d : " % (lists[cnt], cnt));
                #    continue
                    pass
                #else:
                #    cnt = cnt;
                #    print("cnt = %d , cnt = len(servs): " % cnt);
                #    print("lists[cnt] =  %s cnt = %d : " % (lists[cnt], cnt));
                #    continue
                #    pass
finally:
    db.close()
print("servs = %s" % servs)
print("The currnt directory is: %s" % strPath)
