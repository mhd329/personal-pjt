# 실제 사용을 위한 import
import time
from enum import Enum
from modules.driver import Driver
from modules.validation import is_valid
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from concurrent.futures import ThreadPoolExecutor
# 타입 명시를 위한 import
from selenium import webdriver
from selenium.webdriver.remote.webelement import WebElement

# searchAttributeValueRep910402.click()

class DanawaScraper:
    """
    각 스크래퍼는 탐색할 페이지 수 만큼 자식 쓰레드를 생성한다.
    """

    url_base: str = "https://prod.danawa.com/"

    @classmethod
    def __select_url(cls, component_name):
        urls = {
            "cpu" : cls.url_base + "list/?cate=112747",
            "mainboard" : cls.url_base + "list/?cate=112747",
        }
        return urls[component_name]

    def __init__(self, driver: webdriver.Chrome, component_name: str):
        # 시간 측정용 멤버변수
        self.crawling_time_start: int = 0
        self.crawling_time_end: int = 0
        self.crawling_time_total: int = 0
        self.__results: dict = {}
        self.driver: webdriver.Chrome = driver
        self.url: str = self.__select_url(component_name)

    # 1단계 : 동적 요소 포함한 페이지 불러오기
    def __call_page(self, url: str) -> None:
        # 드라이버 실행
        self.driver.get(url)

    # 2-1단계 : 찾을 CPU 리스트 가져오기
    def __get_cpu_checkboxlist(self) -> list[WebElement]:
        ul_list: WebElement = self.driver.find_element(By.XPATH, '//*[@id="simpleSearchOptionpriceCompare"]/div/dl[5]/dd/ul[1]')
        checkbox_list = ul_list.find_elements(By.TAG_NAME, "li") # 리스트 묶음
        return checkbox_list

    # 2-2단계 : 찾을 Mainboard 리스트 가져오기
    def __get_mainboard_checkboxlist(self) -> list[WebElement]:
        ul_list: WebElement = self.driver.find_element(By.XPATH, '//*[@id="simpleSearchOptionpriceCompare"]/div/dl[2]/dd/ul[1]')
        checkbox_list = ul_list.find_elements(By.TAG_NAME, "li") # 리스트 묶음
        return checkbox_list

    # 3단계 : 불러온 페이지에서 특정 체크박스 클릭
    def __click_checkbox(self, checkbox_label: WebElement) -> None:
        checkbox: WebElement = checkbox_label.find_element(By.XPATH, './label/input')
        checkbox.click()

    # 4단계 : 리스트에서 정보 수집
    def __grap_list(self):
        pass

    # 5단계 : 리스트에

    # 4단계 : 개별 CPU에 대해 소켓, 세대 등 스펙 추출
    def __extract_spec(self):
        pass

    # 모든 절차 순서대로 수행
    def do_crawling(self):
        self.crawling_time_start = time.time() # 시간 측정용
        # cpu, 메인보드 url에 대하여 탐색 수행
            # 여기부터는 페이지가 켜져있는 상태임
        try:
            self.__call_page(url)
            checkbox_list = self.__get_cpu_checkboxlist()
            for checkbox_label in checkbox_list:
                self.__click_checkbox(checkbox_label)
                # 개별 체크박스 선택 마다 나오는 여러 페이지에 대해 멀티쓰레딩 수행
                

        # 모든 예외 발생시 드라이버를 종료해줘야 한다.
        except:
            self.driver.quit()
        finally:
            # 시간 측정용
            self.crawling_time_end = time.time()
            # 5초 내외로 나옴
            self.crawling_time_total = self.crawling_time_end - self.crawling_time_start
            print(f"크롤링 소요 시간: {self.crawling_time_total}")
        # 페이지 번호와 그에 해당하는 제품 리스트를 반환
        return 

    # 결과를 받아오는 메서드
    def get_results(self):
        # 결과를 받기 전 반드시 종료해주어야 한다.
        self.driver.quit()
        return self.__results

    # def crawl_with_for(self):
    #     # 해당 번호까지의 전체 범위를 탐색한다.
    #     for i in range(1, self.__page_no + 1):
    #         self.__results[i] = self.__find_subtext_in_page(i)

    def crawl_with_multithreading(self, page_length):
        page_length = min(page_length, 12) # 탐색할 페이지 길이만큼의 쓰레드 할당, 최대 12개
        with ThreadPoolExecutor(max_workers=page_length) as excutor:
            results = excutor.map(
                self.__find_subtext_in_page, [*range(1, self.__page_no + 1)]
            )
        for page_no, prd_list in [*results]:
            self.__results[page_no] = prd_list

    def crawl_with_multiprocessing(self):
        result = self.__do_crawling()
        self.__results[result[0]] = result[1]
