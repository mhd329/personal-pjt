from bs4 import BeautifulSoup
from selenium import webdriver
from modules.validation import is_valid
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager


# 페이지 완성시키기
def call_all_dynamic_element(url):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options,
    )
    driver.get(url)
    try:
        # product_list_ul의 길이가 달라질 때까지 스크롤 내리기
        i = 0
        while i < 10:
            # 동적 요소가 렌더링된 페이지에서 product_list_ul을 찾는다.
            product_list = driver.find_element(By.CLASS_NAME, "product_list_ul")
            # 해당 리스트 하위의 서브텍스트가 몇 개인지 모두 찾는다.
            subtext_elements = product_list.find_elements(By.CLASS_NAME, "prd_subTxt")
            if len(subtext_elements) == 20:
                break
            driver.find_element(By.TAG_NAME, "body").send_keys(Keys.PAGE_DOWN)
            i += 1
    finally:
        for e in subtext_elements:
            print("#################################")
            print(e.text)
            print("#################################")
        target_page = driver.page_source
        driver.quit()
    return target_page


# 완성된 페이지 파싱
def get_response(page_no):
    url = f"https://www.compuzone.co.kr/product/productB_new_list.htm?actype=getPaging&SelectProductNo=&orderlayerx=&orderlayery=&BigDivNo=1&PageCount=20&StartNum={(page_no - 1) * 20}&PageNum={page_no}&PreOrder=recommand&lvm=L&ps_po=P&DetailBack=&CompareProductNoList=&CompareProductDivNo=&IsProductGroupView=&ScrollPage=3&ProductType=biglist&setPricechk=&SchMinPrice=&SchMaxPrice=&sel_mediumdiv=%C1%DF%BA%D0%B7%F9&sel_div=%BC%D2%BA%D0%B7%F9&select_page_cnt=60"
    target_page = call_all_dynamic_element(url)
    soup = BeautifulSoup(target_page, "html.parser")
    result = soup.find_all("div", "prd_subTxt")
    print(result)
    return result


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

    --------------------------------------------------------------------------------
    Date: 2023. 09. 14
    Class: Crawler Class
    Author: HyeonDong Moon
    """

    def __init__(self, page_no: int = 1):
        try:
            if is_valid(page_no):
                self._page_no = page_no
                self._results = []
        except TypeError as error:
            raise TypeError(str(error))
        except ValueError as error:
            raise ValueError(str(error))

    # 결과를 받아오는 메서드
    def get_results(self):
        # 해당 번호까지의 전체 범위를 탐색한다.
        for i in range(1, self._page_no + 1):
            self._results.append(get_response(i))
        return self._results
