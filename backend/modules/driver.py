import sys
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


# 드라이버 만들기
class Driver:
    def __init__(self, *args: (str)) -> None:
        print(f"backend.modules.driver.py / *args : {args}")
        self.options = Options()
        self.options.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
        )
        if "debugpy" in sys.modules:
            self.options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
        if "debugpy" not in sys.modules: # 디버그 모드가 아닌 경우 args 추가
            for option in args:
                self.options.add_argument(option)

    def make_driver(self) -> webdriver:
        driver = webdriver.Chrome(
            options=self.options,
        )
        return driver
