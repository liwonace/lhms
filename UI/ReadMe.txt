webmin + UI : docker image(contrainer)

You need the apache.conf file. (OS : ubuntu 18.04 setting file)

# start webmin + UI
1. docker image pull
   docker pull liwonace/lhms:1.0
   
2. docker image run
   docker run -it -p 55:55/tcp -p 10000:10000/tcp -p 3000:3000/tcp --name webmin -v /etc/localtime:/etc/localtime:ro -e TZ=Asia/Seoul --dns 8.8.8.8 docker.io/liwonace/lhms:1.0

3. 도커 컨테이너 안에서 필요 프로세스 시작
   service apache2 start
   service ssh start
   service webmin start

4. UI 시작
   cd /root/lhms
   node index.js
   
5. .env파일의 변수 값들은 필히 수정하여 사용해야 됨.(/root/lhms)
