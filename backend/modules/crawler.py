import time
from modules.driver import Driver
from modules.validation import is_valid
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys


url_base = "https://prod.danawa.com/"
url_cpu = url_base + "list/?cate=112747"
url_mainboard = url_base + "list/?cate=112751"
url_list = [url_cpu, url_mainboard]

# searchAttributeValueRep910402.click()

class DanawaCrawler:
    def __init__(self):
        self.crawling_time_start = 0
        self.crawling_time_end = 0
        self.crawling_time_total = 0
        self.__results = {}
        self.driver = Driver("--headless", "--disable-gpu").make_driver()

    # 1단계 : 동적 요소 포함한 페이지 불러오기
    def __call_page(self, url):
        # 드라이버 실행
        self.driver.get(url)

    # 2단계 : 불러온 페이지에서 각 소켓 체크박스 클릭
    # def __click_socket_list(self, element_li):
    #     target = self.driver.find_element(By.XPATH, '//*[@id="simpleSearchOptionpriceCompare"]/div/dl[3]/dd/ul[1]/li[1]')
    #     target.click()

    # 3단계 : 소켓에 해당하는 CPU 목록 수집
    def __grap_list(self):
        pass

    # 4단계 : 개별 CPU에 대해 소켓, 세대 등 스펙 추출
    def __extract_spec(self):
        pass

    # 모든 절차 순서대로 수행
    def do_crawling(self):
        self.crawling_time_start = time.time() # 시간 측정용
        # cpu, 메인보드 url에 대하여 탐색 수행
        for url in url_list:
            # 여기부터는 페이지가 켜져있는 상태임
            try:
                self.__call_page(url)
                # 모든 체크박스에 대해 동작을 반복해야 함.
                list_ul = self.driver.find_element(By.XPATH, '//*[@id="simpleSearchOptionpriceCompare"]/div/dl[3]/dd/ul[1]')
                list_li = list_ul.find_elements(By.TAG_NAME, "li")
                for li in list_li:
                    li.click()
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

    # def crawl_with_multithreading(self):
    #     with ThreadPoolExecutor(max_workers=12) as excutor:
    #         results = excutor.map(
    #             self.__find_subtext_in_page, [*range(1, self.__page_no + 1)]
    #         )
    #     for page_no, prd_list in [*results]:
    #         self.__results[page_no] = prd_list

    def crawl_with_multiprocessing(self):
        result = self.__do_crawling()
        self.__results[result[0]] = result[1]
