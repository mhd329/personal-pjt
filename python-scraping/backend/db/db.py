import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

db = pymysql.connect(
    host=os.getenv("MYSQL_HOST"),
    user=os.getenv("MYSQL_USER"),
    password=os.getenv("MYSQL_PASSWORD"),
    db=os.getenv("MYSQL_DATABASE"),
)
