import logging
from datetime import datetime


logger = logging.getLogger("log_palserver")
logger.setLevel(logging.INFO)


log_format = "%(asctime)s %(levelname)-7s %(message)s [%(filename)s:%(lineno)s]"


logging.basicConfig(
    filename=f"{logger.name}_{datetime.now().strftime('%y%m%d')}.log",
    filemode="a",
    format=log_format,
    level=logging.INFO,
)