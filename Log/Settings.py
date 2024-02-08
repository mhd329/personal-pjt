import logging
from datetime import datetime

# log
logger = logging.getLogger("log_palserver")
logger.setLevel(logging.INFO)
log_filename=f"{logger.name}_{datetime.now().strftime('%y%m%d')}.log"
log_format = "%(asctime)s %(levelname)-7s %(message)s [%(filename)s:%(lineno)s -> %(funcName)s()]"
log_handler = logging.FileHandler(log_filename, mode="a", encoding="utf-8")
log_handler.setFormatter(log_format)
logger.addHandler(log_handler)

# log_detail
logger_detail = logging.getLogger("log_detail_palserver")
logger_detail.setLevel(logging.INFO)
log_detail_filename=f"{logger_detail.name}_{datetime.now().strftime('%y%m%d')}.log"
log_detail_format = "%(asctime)s %(levelname)-7s %(message)s [%(filename)s:%(lineno)s -> %(funcName)s()]"
log_detail_handler = logging.FileHandler(log_detail_filename, mode="a", encoding="utf-8")
log_detail_handler.setFormatter(log_detail_format)
logger_detail.addHandler(log_detail_handler)