import time
from modules.driver import Driver
from selenium.webdriver.common.by import By
from modules.validation import is_valid
from selenium.webdriver.common.keys import Keys


# 동적 요소 포함한 페이지 완성시키기
def call_page(driver, static_page_no):
    base_url = "https://www.compuzone.co.kr/product/"
    uri1 = "productB_new_list.htm?actype=getPaging"
    uri2 = "&SelectProductNo=&orderlayerx=&orderlayery=&BigDivNo=1"
    page_count = "&PageCount=20"
    start_num = f"&StartNum={(static_page_no - 1) * 20}"
    page_num = f"&PageNum={static_page_no}"
    uri3 = "&PreOrder=recommand&lvm=L&ps_po=P&DetailBack=&CompareProductNoList="
    uri4 = "&CompareProductDivNo=&IsProductGroupView=&ScrollPage=3&ProductType=biglist&setPricechk=&SchMinPrice="
    uri5 = "&SchMaxPrice=&sel_mediumdiv=%C1%DF%BA%D0%B7%F9&sel_div=%BC%D2%BA%D0%B7%F9&select_page_cnt=60"
    full_url = base_url + uri1 + uri2 + page_count + start_num + page_num + uri3 + uri4 + uri5
    # 드라이버 실행
    driver.get(full_url)


class DanawaCrawler:
    def __init__(self, page_no: int = 1):
        try:
            if is_valid(page_no):
                self.__page_no = page_no
                self.__results = {}
                self.driver = Driver("--headless", "--disable-gpu").make_driver()
        except TypeError as error:
            raise TypeError(str(error))
        except ValueError as error:
            raise ValueError(str(error))

    # 서브텍스트를 찾고 그것으로 spec객체 만들기
    def __find_subtext_in_page(self, target_page_no):
        start_time = time.time()
        # 순서가 중요하지 않으므로 리스트에 담음
        prd_list = []
        subtext_elements = None
        call_page(self.driver, target_page_no)
        # 위의 함수가 성공적으로 실행 => 현재 대상 페이지가 켜져있는 상태임
        try:
            product_list = self.driver.find_element(By.ID, "product_list_ul")
            # product_list_ul의 길이가 달라질 때까지 스크롤 내리기
            i = 0
            # page down 횟수는 최대 10회로 설정
            while i < 10:
                # 해당 리스트 하위의 서브텍스트가 몇 개인지 모두 찾는다.
                subtext_elements = product_list.find_elements(
                    By.CLASS_NAME, "prd_subTxt"
                )
                # 컴퓨존은 한 페이지당 기본적으로 스무개의 상품과 그에 대한 subTxt가 있음
                # 스무개가 다 나올때까지 page down
                if len(subtext_elements) == 20:
                    break
                self.driver.find_element(By.TAG_NAME, "body").send_keys(Keys.PAGE_DOWN)
                i += 1
            # 반복문이 종료되면 찾아진 subtext들에 대해 부품정보 추출 실행
            if subtext_elements:
                # 해당하는 가격들도 모두 찾는다.
                price_elements = product_list.find_elements(
                    By.CLASS_NAME, "prc_guide_ly"
                )
                subtext_len = len(subtext_elements)
                # 반복하며 분석한다.
                for i in range(subtext_len):
                    # 제품의 링크
                    prd_a_tag = subtext_elements[i].find_element(By.TAG_NAME, "a")
                    prd_link = prd_a_tag.get_attribute("href")
                    # 제품의 가격 정수화
                    price_element = price_elements[i]
                    prd_price = int(
                        price_element.text.replace(",", "").replace("원", "")
                    )
        # 모든 예외 발생시 드라이버를 종료해줘야 한다.
        except:
            self.driver.quit()
        finally:
            # 시간 측정용
            end_time = time.time()
            # 5초 내외로 나옴
            print(f"소요 시간: {end_time - start_time}")
        # 페이지 번호와 그에 해당하는 제품 리스트를 반환
        return target_page_no, prd_list

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
        result = self.__find_subtext_in_page(self.__page_no)
        self.__results[result[0]] = result[1]
