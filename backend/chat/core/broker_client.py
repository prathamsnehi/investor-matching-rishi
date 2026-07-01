import os
from taskiq_redis import ListQueueBroker

base_redis_url = os.getenv("REDIS_URL", "redis://redis:6379")
if base_redis_url.rfind("/") > base_redis_url.find("://") + 2:
    base_redis_url = base_redis_url.rsplit("/", 1)[0]

chat_broker = ListQueueBroker(url=f"{base_redis_url}/3")

# THIS IS A STUB! It allows the Chat service to trigger the Worker 
@chat_broker.task(task_name="workers.tasks:flush_chat_messages_to_db")
async def trigger_flush_task():
    pass