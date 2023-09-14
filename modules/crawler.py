import requests
from validation import isvalid
from bs4 import BeautifulSoup


# https://www.compuzone.co.kr/product/productB_new_list.htm?actype=getPaging&SelectProductNo=&orderlayerx=&orderlayery=&BigDivNo=1&PageCount=20&StartNum=40&PageNum=1&PreOrder=recommand&lvm=L&ps_po=P&DetailBack=&CompareProductNoList=&CompareProductDivNo=&IsProductGroupView=&ScrollPage=3&ProductType=biglist&setPricechk=&SchMinPrice=&SchMaxPrice=&sel_mediumdiv=%C1%DF%BA%D0%B7%F9&sel_div=%BC%D2%BA%D0%B7%F9&select_page_cnt=60


class CompuzoneCrawler:
    """
    Basic usage:
    기본 사용법:

    crawler = CompuzoneCrawler()
    print(crawler.get_results())

    '_url' refers to a 'CompuZone'.
    When you initialize this class, you can assign any number like this.
    '_url'은 'CompuZone'을 가리킵니다.
    클래스를 초기화할 때 아래와 같이 번호를 지정할 수 있습니다.

    crawler = CompuzoneCrawler(10)

    This means exploring from the first page to the page with that number(10).
    Or you can specify a range like this(5, 10).
    이렇게 하면 첫 페이지에서 해당 페이지 까지를 탐색합니다.
    또는 아래와 같이 범위(5, 10)를 지정할 수도 있습니다.

    crawler = CompuzoneCrawler(5, 10)

    Then it will explore the website with you gaved range.
    If you do not specify a number, by default, class will only be explored one page.
    그러면 설정된 범위에서 컴퓨존의 상품들을 탐색합니다.
    만약 숫자를 지정하지 않으면, 기본적으로 맨 처음 페이지만 탐색합니다.

    Date: 2023. 09. 14
    Class: Crawler Class
    Author: HyeonDong Moon
    """

    def __init__(self, start: int = None, last: int = None):
        try:
            if isvalid(start, last):
                self._start = start
                self._last = last
                self._results = []
        except TypeError as error:
            raise TypeError(str(error))
        except ValueError as error:
            raise ValueError(str(error))

    def get_results(self):
        if self._start:
            if self._last:
                self._explore_partial_range(self._start, self._last)
            else:
                self._explore_full_range(self._start)
        else:
            self._explore_one_page()
        return self._results

        # Basic request method
    # 기본 요청 메서드
    def _get_response(self, page_no=1):
        url = f"https://www.compuzone.co.kr/product/productB_new_list.htm?actype=getPaging&SelectProductNo=&orderlayerx=&orderlayery=&BigDivNo=1&PageCount=20&StartNum=40&PageNum={page_no}&PreOrder=recommand&lvm=L&ps_po=P&DetailBack=&CompareProductNoList=&CompareProductDivNo=&IsProductGroupView=&ScrollPage=3&ProductType=biglist&setPricechk=&SchMinPrice=&SchMaxPrice=&sel_mediumdiv=%C1%DF%BA%D0%B7%F9&sel_div=%BC%D2%BA%D0%B7%F9&select_page_cnt=60"
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, "html.parser")
            result = soup  # 분류 작업 해야함
            self._result = result
        else:
            self._result = {
                "code": response.status_code,
                "status": "Failure",
                "page_no": page_no,
                "message": "Request faliure with code",
            }
        return self._result

    # Basic exploring
    # Explore to the first page only.
    # 첫 페이지만 탐색한다.
    def _explore_one_page(self):
        self._results.append(self._get_response())

    # Wide exploring
    # Explore a wide range to that page.
    # 해당 번호까지의 넓은 범위를 탐색한다.
    def _explore_full_range(self, index):
        for i in range(1, index + 1):
            self._results.append(self._get_response(i))

    # Scope exploring
    # It explores the range between the start index and the last index.
    # 시작 인덱스와 마지막 인덱스 사이의 범위를 탐색한다.
    def _explore_partial_range(self, start, last):
        for i in range(start, last + 1):
            self._results.append(self._get_response(i))
