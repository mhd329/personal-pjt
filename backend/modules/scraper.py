# 실제 사용을 위한 import
import time
from enum import Enum
from re import compile
from collections import deque
from modules.driver import Driver
from modules.validation import is_valid
from selenium.webdriver.common.by import By
from selenium.webdriver import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
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
        self.wait = WebDriverWait(driver, 15)
        self.action = ActionChains(driver)
        self.url: str = self.__select_url(component_name)
        self.component_type: int = Component[component_name].value

    # 체크박스 클릭 시 요소 로딩 기다리기
    def __wait_elements(self) -> None:
        container: WebElement = self.driver.find_element(By.ID, "danawa_container")
        product_list_cover = container.find_element(By.CLASS_NAME, "product_list_cover")
        def check_loading(driver): # 아무 인자도 받지 않는 경우 에러가 발생함
            if product_list_cover.value_of_css_property("display") == "none":
                return True
            # while True:
            #     print(product_list_cover.value_of_css_property("display"))
            #     if product_list_cover.value_of_css_property("display") == "none":
            #         return True
        self.wait.until(check_loading) # check_loading에는 드라이버가 매개변수로 주어짐

    # 1단계 : 찾을 CPU / Mainboard 리스트 가져오기
    def __get_checkbox_list(self) -> list[WebElement]:
        ul_list: WebElement = self.driver.find_element(By.XPATH, f'//*[@id="simpleSearchOptionpriceCompare"]/div/dl[{self.component_type}]/dd/ul[1]')
        checkbox_list: list[WebElement] = ul_list.find_elements(By.TAG_NAME, "li") # 리스트 묶음
        # print("checkbox length :", len(checkbox_list))
        return checkbox_list

    # 2단계 : 불러온 페이지에서 특정 체크박스 클릭
    def __click_checkbox(self, checkbox: WebElement) -> bool:
        try:
            checkbox_label: WebElement = checkbox.find_element(By.XPATH, './label/input')
        except:
            # 라벨 찾지 못함
            print("Label not found.")
            return False
        checkbox_label.click()
        return True

    # 3단계 : 클릭된 체크박스당 pagenation 개수 파악
    def __find_pagenation_num(self) -> tuple[list[WebElement]]:
        """
        tuple 형식으로 반환 : \n
        [0] 번째 요소는 page numbers, \n
        [1] 번째 요소는 buttons
        """
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

    # 4단계 : 단일 페이지 내에서 상품 리스트 찾기
    def __find_products(self) -> list[WebElement]:
        product_area: WebElement = self.driver.find_element(By.ID, "productListArea")
        product_list_div: WebElement = product_area.find_element(By.CLASS_NAME, "main_prodlist")
        product_list_ul: WebElement = product_list_div.find_element(By.TAG_NAME, "ul")
        products: list[WebElement] = product_list_ul.find_elements(By.TAG_NAME, "li")
        return products
    
    # 5단계 : 단일 상품의 스펙을 정제하여 반환
    def __find_specs(self, product: WebElement) -> dict:
        product_info_box: WebElement = product.find_element(By.CLASS_NAME, "prod_main_info")

        spec_list = []
        price_list = []

        # 상품 이미지
        # product_image: WebElement = product_info_box.find_element(By.XPATH, "./div[1]/a[1]")

        product_info: WebElement = product_info_box.find_element(By.XPATH, "./div[2]")
        product_name_rank: WebElement = product_info.find_element(By.CLASS_NAME, "prod_name")

        # 상품 순위
        try:
            product_rank: WebElement = product_name_rank.find_element(By.CLASS_NAME, "pop_rank")
            product_rank_text: str = product_rank.text
        except:
            # 순위권 밖 상품
            product_rank_text: str = ""

        # 상품 이름
        product_name: WebElement = product_name_rank.find_element(By.TAG_NAME, "a")
        product_name_text: str = product_name.text

        # 상품 스펙 #############################
        product_spec_set: WebElement = product_info.find_element(By.CLASS_NAME, "prod_spec_set")
        product_specs: list[WebElement] = product_spec_set.find_elements(By.XPATH, "./dd/div/*")
        for product_spec in product_specs:
            spec_list.append(product_spec.text)
        
        # 상품 날짜 
        product_sub_info: WebElement = product_info.find_element(By.CLASS_NAME, "prod_sub_info")
        product_date: WebElement = product_sub_info.find_element(By.XPATH, "./div/dl[1]/dd")
        product_date_text: str = product_date.text

        # 상품 가격 ##############
        product_price_list: list[WebElement] = product_info_box.find_elements(By.XPATH, "./div[3]/ul/li")
        for item in product_price_list:
            product_price: WebElement = item.find_element(By.XPATH, "./p[2]/a/strong")
            price_list.append(product_price.text)

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
            self.driver.get(self.url)
            checkbox_list: list[WebElement] = self.__get_checkbox_list() # 1
            for checkbox in checkbox_list:
                if not self.__click_checkbox(checkbox): # 2
                    break
                self.__wait_elements()
                click_next_button = True
                while click_next_button:
                    """
                    next button 누를 때마다 pagenation_set 다시 찾아야 함
                    """
                    click_next_button = False

                    pagenation_set: tuple[list[WebElement]] = self.__find_pagenation_num() # 3
                    number_list: list[WebElement] = pagenation_set[0]
                    index_initial_number = int(number_list[0].text) # 1, 11, 21, ...
                    index_numbers: deque = deque(str(i) for i in range(index_initial_number, index_initial_number + len(number_list)))

                    for index_number in index_numbers:
                        """
                        각 페이지 클릭 후 페이지별 상품 목록에서 spec 확인
                        """
                        pagenation_set: tuple[list[WebElement]] = self.__find_pagenation_num() # 3
                        new_numbers: deque[WebElement] = deque(pagenation_set[0])
                        """
                        매번 self.__find_pagenation_num() 를 하는 이유는,
                        number.click() 할 때 마다 새로 number 요소를 찾아주지 않으면 number.click() 시 stale error 가 발생함
                        (페이지가 새로 갱신되었을 때 예전의 요소를 불러오려고 하면 발생)
                        button.click() 의 경우도 마찬가지임
                        """
                        while index_number != new_numbers[0].text:
                            new_numbers.popleft()
                        self.action.move_to_element(new_numbers[0]).click().perform()
                        # new_numbers[0].click()
                        self.__wait_elements()
                        product_list: list[WebElement] = self.__find_products() # 4
                        result_specs = []
                        for product in product_list:
                            product_id = product.get_attribute("id")
                            if p.match(product_id): # 상품이 맞는 경우
                                result_specs.append(self.__find_specs(product)) # 5
                        result.append(result_specs)

                    # number.click() 반복이 끝나면 새로 로딩되었기 때문에 button도 새로 찾아야 한다고 가정하고 코드 작성.
                    pagenation_set: tuple[list[WebElement]] = self.__find_pagenation_num() # 3
                    buttons: list[WebElement] | list = pagenation_set[1]

                    # 만약 '다음 페이지' 버튼 있으면 포함해서 클릭
                    for button in buttons:
                        class_name: list[str] = button.get_attribute("class").split()
                        if "nav_next" in class_name:
                            button.click()
                            self.__wait_elements()
                            click_next_button = True

                self.__click_checkbox(checkbox) # 체크박스 체크 해제
                self.__wait_elements()

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
