#!/bin/bash
# docker run --rm -v `pwd`:/data -p 9229:9229 -p 8080:8080 --name puppeteer hexxa/puppeteer-alpine node --inspect=0.0.0.0:9229 /data/index.js
#docker run --rm -v `pwd`:/data -p 9229:9229 -p 8080:8080 --name puppeteer hexxa/puppeteer-alpine node --inspect-brk=0.0.0.0:9229 /data/index.js
#docker start puppeteer
#docker attach puppeteer
echo '------ run containers ------'

docker swarm init
docker stack deploy -c docker-compose.yml goldspider

echo '------ finished ! ------'

