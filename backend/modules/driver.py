from selenium import webdriver
from selenium.webdriver.chrome.options import Options


# 드라이버 만들기
class Driver:
    def __init__(self, *args: str) -> None:
        self.options = Options()
        self.options.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
        )
        print("init args :", args)
        if args:
            for option in args:
                self.options.add_argument(option)

    def make_driver(self) -> webdriver:
        driver = webdriver.Chrome(
            options=self.options,
        )
        return driver
