# 실제 사용을 위한 import
import time
from enum import Enum
from re import compile
from modules.driver import Driver
from modules.validation import is_valid
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
# 타입 명시를 위한 import
from selenium import webdriver
from selenium.webdriver.remote.webelement import WebElement

# test
import modules

class Component(Enum):
    CPU = 5
    MAINBOARD = 2

class DanawaScraper:
    """
    각 스크래퍼는 탐색할 페이지 수 만큼 자식 쓰레드를 생성한다.
    """
    url_base: str = "https://prod.danawa.com/"

    @classmethod
    def __select_url(cls, component_name: str):
        urls = {
            "CPU" : cls.url_base + "list/?cate=112747",
            "MAINBOARD" : cls.url_base + "list/?cate=112751",
        }
        return urls[component_name]

    def __init__(self, driver: webdriver.Chrome, component_name: str):
        # 시간 측정용 멤버변수
        self.scraping_time_start: int = 0
        self.scraping_time_end: int = 0
        self.scraping_time_total: int = 0
        
        self.results: list = []
        self.driver: webdriver.Chrome = driver
        self.url: str = self.__select_url(component_name)
        self.component_type: int = Component[component_name].value

    # 1단계 : 동적 요소 포함한 페이지 불러오기
    def __call_page(self, url: str) -> None:
        # 드라이버 실행
        self.driver.get(url)

    # 2단계 : 찾을 CPU / Mainboard 리스트 가져오기
    def __get_checkbox_list(self) -> list[WebElement]:
        ul_list: WebElement = self.driver.find_element(By.XPATH, f'//*[@id="simpleSearchOptionpriceCompare"]/div/dl[{self.component_type}]/dd/ul[1]')
        checkbox_list: list[WebElement] = ul_list.find_elements(By.TAG_NAME, "li") # 리스트 묶음
        return checkbox_list

    # 3단계 : 불러온 페이지에서 특정 체크박스 클릭
    def __click_checkbox(self, checkbox: WebElement) -> None:
        checkbox_label: WebElement = checkbox.find_element(By.XPATH, './label/input')
        checkbox_label.click()

    # 4단계 : 클릭된 체크박스당 pagenation 개수 파악
    def __find_pagenation_num(self) -> tuple[list[WebElement]]:
        # page_box: WebElement = self.driver.find_element(By.XPATH, f'//*[@id="productListArea"]/div[{self.component_type}]/div')
        num_nav_wrap: WebElement = self.driver.find_element(By.CLASS_NAME, "num_nav_wrap")
        try:
            buttons: list[WebElement] = num_nav_wrap.find_elements(By.TAG_NAME, "a")
        except:
            print("error")
            buttons = []
        number_wrap: WebElement = num_nav_wrap.find_element(By.TAG_NAME, "div")
        page_numbers: list[WebElement] = number_wrap.find_elements(By.TAG_NAME, "a")
        return (page_numbers, buttons)

    # 5단계 : pagenation 번호마다 클릭
    def __click_pagenation(self, page_number: WebElement) -> None:
        page_number.click()

    # 6단계 : 단일 페이지 내에서 상품 리스트 찾기
    def __find_products(self) -> list[WebElement]:
        product_box: WebElement = self.driver.find_element(By.XPATH, '//*[@id="productListArea"]/div[3]/ul')
        product_list: list[WebElement] = product_box.find_elements(By.TAG_NAME, "li")
        return product_list
    
    # 7단계 : 상품 리스트에 있는 단일 상품들 스펙 분석
    def __find_specs(self, product_info: WebElement) -> WebElement:
        spec_list_box: WebElement = product_info.find_element(By.XPATH, '//./div/div[2]/dl/dd/div')
        spec_list: list[WebElement] = spec_list_box.find_elements(By.XPATH, "./*")
        return spec_list

    def __sub2(self, product_info: WebElement) -> list[WebElement | None]:
        p = compile(r"productItem\d+")
        product_id = product_info.get_attribute("id")
        results_sub2 = []
        if p.match(product_id): # 상품이 맞는 경우
            results_sub2 = DanawaScraper.__find_specs(product_info)
        return results_sub2

    def __sub1(self, page_number: WebElement) -> list[WebElement]:
        self.__click_pagenation(page_number)
        product_list: list[WebElement] = self.__find_products()
        results_sub1 = []
        # workers: int = len(product_list)
        # with ThreadPoolExecutor(max_workers=workers) as excutor:
        with ThreadPoolExecutor(max_workers=30) as excutor:
            results_sub1 = [result for result in excutor.map(self.__sub2, product_list)]
        return results_sub1

    # 모든 절차 순서대로 수행
    def main(self) -> list[list[WebElement] | None]:

        results_main: list = []
        self.scraping_time_start = time.time() # 시간 측정용
        # cpu, 메인보드 url에 대하여 탐색 수행
        # 여기부터는 페이지가 켜져있는 상태임

        try:
            self.__call_page(self.url) # 1
            checkbox_list: list[WebElement] = self.__get_checkbox_list() # 2
            for checkbox in checkbox_list:
                # 3 (체크박스 체크)
                self.__click_checkbox(checkbox)

                click_next_button = True
                while click_next_button:
                    """
                    next button 누를 때마다 pagenation_set 다시 찾아야 함
                    """
                    click_next_button = False

                    pagenation_set: tuple[list[WebElement]] = self.__find_pagenation_num() # 4
                    numbers: list[WebElement] = pagenation_set[0]
                    buttons: list[WebElement] | list = pagenation_set[1]

                    workers = min(10, len(numbers))
                    # with ProcessPoolExecutor(max_workers=workers) as excutor:
                    with ThreadPoolExecutor(max_workers=workers) as excutor:
                        print(__name__)
                        """
                        각 페이지 클릭 후 페이지별 상품 목록에서 spec 확인
                        """
                        results_sub1: list[list[WebElement] | None] = list(excutor.map(self.__sub1, numbers)) # 5
                        results_main = results_sub1
                    for i in results_sub1:
                        results_main.append(i)

                    # 만약 '다음 페이지' 버튼 있으면 포함해서 클릭
                    for button in buttons:
                        class_name: list[str] = button.get_attribute("class").split()
                        if "nav_next" in class_name:
                            button.click()
                            click_next_button = True
                # 3 (체크박스 체크 해제)
                self.__click_checkbox(checkbox)

        # 모든 예외 발생시 드라이버를 종료해줘야 한다.
        except Exception as e:
            print(__name__)
            print(e)
            print(type(e))
            self.driver.quit()
        finally:
            # 시간 측정용
            self.scraping_time_end = time.time()
            self.scraping_time_total = self.scraping_time_end - self.scraping_time_start
            print(f"소요 시간: {self.scraping_time_total}")
        # 페이지 번호와 그에 해당하는 제품 리스트를 반환
        return results_main

    # def run(self) -> list[list[WebElement] | None]:
    #     results_main: list[list[WebElement] | None] = self.main()
    #     self.driver.quit()
    #     self.results: list[list[WebElement] | None] = results_main
