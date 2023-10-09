from selenium import webdriver
from selenium.webdriver.chrome.options import Options


# 드라이버 만들기
class Driver:
    """
    드라이버 생성 클래스
    --------------------------------------------------------------------------------

    받은 옵션으로 드라이버를 생성하는 클래스입니다.

    --------------------------------------------------------------------------------
    Date: 2023. 10. 09
    Class: Driver Class
    Author: HyeonDong Moon
    """
    compatibility = "Mozilla/5.0"
    platform = "(Windows NT 10.0; WOW64)"
    rendering_engine = "AppleWebKit/537.36"
    based = "(KHTML, like Gecko)"
    version = "Chrome/117.0.0.0 Safari/537.36"

    def __init__(self, *args: str) -> None:
        self.options = Options()
        self.options.add_argument(
            f"user-agent=\
            {Driver.compatibility} \
            {Driver.platform} \
            {Driver.rendering_engine} \
            {Driver.based} \
            {Driver.version}"
        )
        # self.options.add_argument("--headless")
        # self.options.add_argument("--disable-gpu")
        for option in args:
            self.options.add_argument(option)

    def make_driver(self) -> webdriver:
        driver = webdriver.Chrome(
            options=self.options,
        )
        return driver
