import os
import logging
from datetime import datetime

basepath = os.getcwd()
log_path = basepath + "/logs"

log_format = logging.Formatter("%(asctime)s %(levelname)-7s %(message)s [%(filename)s:%(lineno)s -> %(funcName)s()]")

# log
logger = logging.getLogger("log_palserver")
logger.setLevel(logging.INFO)
log_filename=f"{log_path}/{logger.name}_{datetime.now().strftime('%y%m%d')}.log"
log_handler = logging.FileHandler(log_filename, mode="a", encoding="utf-8")
log_handler.setFormatter(log_format)
logger.addHandler(log_handler)

# log_detail
logger_detail = logging.getLogger("log_detail_palserver")
logger_detail.setLevel(logging.INFO)
log_detail_filename=f"{log_path}/{logger_detail.name}_{datetime.now().strftime('%y%m%d')}.log"
log_detail_handler = logging.FileHandler(log_detail_filename, mode="a", encoding="utf-8")
log_detail_handler.setFormatter(log_format)
logger_detail.addHandler(log_detail_handler)