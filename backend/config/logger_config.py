import logging
from logging import StreamHandler

class FundmatchLogger:
    def __init__(self, level: logging._Level = logging.DEBUG) -> None:
        self.level = level
    
    def setup_logging(self) -> None:
        root_logger = logging.getLogger()
        root_logger.setLevel(self.level)

        if root_logger.handlers:
            return
        
        formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s:%(lineno)d | %(message)s"
        )

        console_handler = StreamHandler()
        console_handler.setFormatter(formatter)

        root_logger.addHandler(console_handler)
