FROM registry.cn-chengdu.aliyuncs.com/mmd0308/nginx:stable-alpine3.20-perl

LABEL authors="hengzq"

ENV TZ=Asia/Shanghai

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY ./dist /usr/share/nginx/html

EXPOSE 80

