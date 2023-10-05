import os
from dotenv import load_dotenv
from webdriver_manager.chrome import ChromeDriverManager


load_dotenv()


class CustomChromeDriverManager(ChromeDriverManager):
    def install(self):
        # 원하는 ChromeDriver 버전 및 경로 지정
        driver_path = os.getenv("DRIVER_PATH")
        self.driver = driver_path
