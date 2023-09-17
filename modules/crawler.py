import requests
from .validation import is_valid
from bs4 import BeautifulSoup


# https://www.compuzone.co.kr/product/productB_new_list.htm?actype=getPaging&SelectProductNo=&orderlayerx=&orderlayery=&BigDivNo=1&PageCount=20&StartNum=40&PageNum=1&PreOrder=recommand&lvm=L&ps_po=P&DetailBack=&CompareProductNoList=&CompareProductDivNo=&IsProductGroupView=&ScrollPage=3&ProductType=biglist&setPricechk=&SchMinPrice=&SchMaxPrice=&sel_mediumdiv=%C1%DF%BA%D0%B7%F9&sel_div=%BC%D2%BA%D0%B7%F9&select_page_cnt=60


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

    # Basic exploring
    # Explore to the first page only.
    # 간단히 첫 페이지만 탐색한다.
    def _explore_simple(self):
        self._results.append(self._get_response(self._page_no))

    # Wide exploring
    # Explore a wide range to that page.
    # 해당 번호까지의 전체 범위를 탐색한다.
    def _explore_wide_range(self, page_no):
        for i in range(1, page_no + 1):
            self._results.append(self._get_response(i))

    # Basic request method
    # 기본 요청 메서드
    def _get_response(self, page_no):
        url = f"https://www.compuzone.co.kr/product/productB_new_list.htm?actype=getPaging&SelectProductNo=&orderlayerx=&orderlayery=&BigDivNo=1&PageCount=20&StartNum={(page_no - 1) * 20}&PageNum={page_no}&PreOrder=recommand&lvm=L&ps_po=P&DetailBack=&CompareProductNoList=&CompareProductDivNo=&IsProductGroupView=&ScrollPage=3&ProductType=biglist&setPricechk=&SchMinPrice=&SchMaxPrice=&sel_mediumdiv=%C1%DF%BA%D0%B7%F9&sel_div=%BC%D2%BA%D0%B7%F9&select_page_cnt=60"
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            result = soup  # 분류 작업 해야함
            # product_list_ul > li:nth-child(1) > div.prdbx > div.prd_info > div.prd_subTxt > a
            self._result = result
        else:
            self._result = {
                "code": response.status_code,
                "status": "Failure",
                "page_no": page_no,
                "message": "Request faliure with code",
            }
        return self._result

    # Method to get exploration results
    # 결과를 받아오는 메서드
    def get_results(self):
        if self._page_no:
            self._explore_wide_range(self._page_no)
        else:
            self._explore_simple()
        return self._results
