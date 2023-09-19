from bs4 import BeautifulSoup
from selenium import webdriver
from modules.validation import is_valid
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager


# 동적 요소 포함한 페이지 완성시키기
def make_dynamic_element_in_static_page(driver, static_page_no):
    url = f"https://www.compuzone.co.kr/product/productB_new_list.htm?actype=getPaging&SelectProductNo=&orderlayerx=&orderlayery=&BigDivNo=1&PageCount=20&StartNum={(static_page_no - 1) * 20}&PageNum={static_page_no}&PreOrder=recommand&lvm=L&ps_po=P&DetailBack=&CompareProductNoList=&CompareProductDivNo=&IsProductGroupView=&ScrollPage=3&ProductType=biglist&setPricechk=&SchMinPrice=&SchMaxPrice=&sel_mediumdiv=%C1%DF%BA%D0%B7%F9&sel_div=%BC%D2%BA%D0%B7%F9&select_page_cnt=60"
    driver.get(url)


# 서브텍스트 찾기
def find_subtext_in_page(driver, target_page_no):
    subtext_list = []
    subtext_elements = None
    make_dynamic_element_in_static_page(driver, target_page_no)
    # 위의 함수가 성공적으로 실행 => 현재 대상 페이지가 켜져있는 상태임
    try:
        # product_list_ul의 길이가 달라질 때까지 스크롤 내리기
        i = 0
        # page down 횟수는 최대 10회
        while i < 10:
            # 동적 요소가 렌더링된 대상 페이지에서 product_list_ul을 찾는다.
            product_list = driver.find_element(By.ID, "product_list_ul")
            # 해당 리스트 하위의 서브텍스트가 몇 개인지 모두 찾는다.
            subtext_elements = product_list.find_elements(By.CLASS_NAME, "prd_subTxt")
            # 컴퓨존은 한 페이지당 스무개의 상품이 있음
            if len(subtext_elements) == 20:
                break
            driver.find_element(By.TAG_NAME, "body").send_keys(Keys.PAGE_DOWN)
            i += 1
    finally:
        if subtext_elements:
            for ele in subtext_elements:
                subtext_list.append(ele.text)
        driver.quit()
    return subtext_list


class CompuzoneCrawler:
    """
    Basic usage:
    기본 사용법:
    --------------------------------------------------------------------------------

    1. When you initialize this class, you can assign any number like this.
    클래스를 초기화할 때 아래와 같이 번호를 지정할 수 있습니다.

    => crawler = CompuzoneCrawler(10)

    2. This means exploring from the first page to the page with that number(10).
    이렇게 하면 첫 페이지에서 해당 페이지 까지를 탐색합니다.

    3. If you do not specify a number, by default, class will only be explored one page.
    만약 숫자를 지정하지 않으면, 기본적으로 맨 처음 페이지만 탐색합니다.

    => crawler = CompuzoneCrawler()

    4. You can get the results like this.
    결과는 이렇게 가져올 수 있습니다.

    => print(crawler.get_results())

    * 결과 받기(get_results) => 먼저 서브텍스트를 찾아야 함(find_subtext_in_page)
        1. 드라이버를 만들고(_make_driver),
        2. 페이지에 동적 요소를 렌더링하고(make_dynamic_element_in_static_page),
        3. 완성된 페이지를 탐색해야 함(find_subtext_in_page > try, finally).

    --------------------------------------------------------------------------------
    Date: 2023. 09. 14
    Class: Crawler Class
    Author: HyeonDong Moon
    """

    def __init__(self, page_no: int = 1):
        try:
            if is_valid(page_no):
                self._page_no = page_no
                self._results = {}
                self._make_driver()
        except TypeError as error:
            raise TypeError(str(error))
        except ValueError as error:
            raise ValueError(str(error))

    # 드라이버 만들기
    def _make_driver(self):
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--disable-gpu")
        options.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
        )
        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=options,
        )
        self._driver = driver

    # 결과를 받아오는 메서드
    def get_results(self):
        # 해당 번호까지의 전체 범위를 탐색한다.
        for i in range(1, self._page_no + 1):
            self._results[i] = find_subtext_in_page(self._driver, i)
        return self._results
