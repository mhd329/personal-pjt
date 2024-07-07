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
        self.options.add_argument('log-level=3') # 서드파티 쿠키 제한 해제 (chrome updated at 2024)
        # 관련 질문 -> https://stackoverflow.com/questions/75771237/error-parsing-cert-retrieved-from-aia-as-der-error-couldnt-read-tbscertifi
        # 공식 문서 -> https://www.chromium.org/Home/chromium-security/root-ca-policy/
        if "debugpy" in sys.modules: # VSCode 디버그 모드인 경우 디버그 옵션으로 실행
            self.options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
        if "debugpy" not in sys.modules: # VSCode 디버그 모드가 아닌 경우 args 추가
            for option in args:
                self.options.add_argument(option)

    def make_driver(self) -> webdriver:
        driver = webdriver.Chrome(
            options=self.options,
        )
        return driver
