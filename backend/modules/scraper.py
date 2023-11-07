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
        number_wrap: WebElement = num_nav_wrap.find_element(By.TAG_NAME, "div")
        try:
            buttons: list[WebElement] = num_nav_wrap.find_elements(By.XPATH, "./a")
        except:
            print("Buttons not found.")
            buttons = []
        page_numbers: list[WebElement] = number_wrap.find_elements(By.XPATH, "./a")
        return (page_numbers, buttons)

    # 5단계 : 단일 페이지 내에서 상품 리스트 찾기
    def __find_products(self) -> list[WebElement]:
        product_area: WebElement = self.driver.find_element(By.ID, "productListArea")
        product_list_div: WebElement = product_area.find_element(By.CLASS_NAME, "main_prodlist")
        product_list_ul: WebElement = product_list_div.find_element(By.TAG_NAME, "ul")
        products: list[WebElement] = product_list_ul.find_elements(By.TAG_NAME, "li")
        return products
    
    # 6단계 : 단일 상품의 스펙을 정제하여 반환
    def __find_specs(self, product: WebElement) -> dict:
        product_info_box: WebElement = product.find_element(By.CLASS_NAME, "prod_main_info")
        spec_list = []
        price_list = []
        # 상품 이미지
        # product_image: WebElement = product_info_box.find_element(By.XPATH, "./div[1]/a[1]")
        
        product_info: WebElement = product_info_box.find_element(By.XPATH, "./div[2]")
        if len(product_info) != 4: # 수동으로 위치 찾아줘야 함
            product_name_rank: WebElement = product_info.find_element(By.CLASS_NAME, "prod_name")

            # 상품 순위
            product_rank: WebElement = product_name_rank.find_element(By.CLASS_NAME, "pop_rank")
            product_rank_text: str = product_rank.text
            print(product_rank_text)

            # 상품 이름
            product_name: WebElement = product_name_rank.find_element(By.TAG_NAME, "a")
            product_name_text: str = product_name.text
            print(product_name_text)

            # 상품 스펙 #############################
            product_spec_set: WebElement = product_info.find_element(By.CLASS_NAME, "prod_spec_set")
            product_specs: list[WebElement] = product_spec_set.find_elements(By.XPATH, "./dd/div/*")
            for product_spec in product_specs:
                spec_list.append(product_spec.text)
                print(product_spec.text)
            
            # 상품 날짜 
            product_date_set: WebElement = product_info.find_element(By.CLASS_NAME, "meta_item mt_date")
            product_date: WebElement = product_date_set.find_element(By.TAG_NAME, "dd")
            product_date_text: str = product_date.text
            print(product_date_text)

        else:
            # 상품 순위
            product_rank: WebElement = product_info.find_element(By.XPATH, "./p/strong")
            product_rank_text: str = product_rank.text
            print(product_rank_text)

            # 상품 이름
            product_name: WebElement = product_info.find_element(By.XPATH, "./p/a")
            product_name_text: str = product_name.text
            print(product_name_text)

            # 상품 스펙 ###################
            product_specs: list[WebElement] = product_info.find_elements(By.XPATH, "./dl/dd/div/*")
            product_spec_text: str = product_spec.text
            print(product_spec_text)

            # 상품 날짜
            product_date: WebElement = product_info.find_element(By.XPATH, "./div[2]/div/dl[1]/dd")
            product_date_text: str = product_date.text
            print(product_date_text)

        # 상품 가격 ##############
        product_price_list: list[WebElement] = product_info_box.find_elements(By.XPATH, "./div[3]/ul/li")
        for item in product_price_list:
            product_price: WebElement = item.find_element(By.XPATH, "./p[2]/a/strong")
            price_list.append(product_price.text)
            print(product_price.text)

        product: dict = {
            "rank" : product_rank_text,
            "name" : product_name_text,
            "spec" : spec_list,
            "date" : product_date_text,
            "price" : price_list,
        }
        return product

    # 모든 절차 순서대로 수행
    def main(self) -> list[list[WebElement] | None]:
        result: list = []
        self.scraping_time_start = time.time() # 시간 측정용
        p = compile(r"productItem\d+") # 상품 확인용 정규 표현식
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

                    for number in numbers: # 5
                        """
                        각 페이지 클릭 후 페이지별 상품 목록에서 spec 확인
                        """
                        number.click()
                        product_list: list[WebElement] = self.__find_products()
                        result_specs = []
                        for product in product_list: # 6
                            product_id = product.get_attribute("id")
                            if p.match(product_id): # 상품이 맞는 경우
                                result_specs.append(self.__find_specs(product))
                        result.append(result_specs)

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
            print(e)
            print(type(e))
            self.driver.quit()
        finally:
            # 시간 측정용
            self.scraping_time_end = time.time()
            self.scraping_time_total = self.scraping_time_end - self.scraping_time_start
            print(f"소요 시간: {self.scraping_time_total}")
        # 페이지 번호와 그에 해당하는 제품 리스트를 반환
        return result

    # def run(self) -> list[list[WebElement] | None]:
    #     results_main: list[list[WebElement] | None] = self.main()
    #     self.driver.quit()
    #     self.results: list[list[WebElement] | None] = results_main
