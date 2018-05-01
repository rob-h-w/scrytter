echo "requirepass ${REDIS_ROOT_PASSWORD}" >> /usr/local/etc/redis/redis.conf
redis-server /usr/local/etc/redis/redis.conf
