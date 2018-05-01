FROM redis:alpine

RUN mkdir -p /usr/local/etc/redis /usr/home
RUN touch /usr/local/etc/redis/redis.conf

COPY launch.sh /usr/home

WORKDIR /usr/home

RUN chmod +x launch.sh

EXPOSE 6379/tcp

CMD ["./launch.sh"]
