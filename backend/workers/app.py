from taskiq_redis import RedisAsyncResultBackend, ListQueueBroker


result_backend = RedisAsyncResultBackend(
    redis_url="redis://localhost:6379/2",
)

broker = ListQueueBroker(
    url="redis://localhost:6379/3",
).with_result_backend(result_backend)