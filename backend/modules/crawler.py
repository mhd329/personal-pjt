import time
from selenium import webdriver
from .validation import is_valid
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options


# 동적 요소 포함한 페이지 완성시키기
def make_dynamic_element_in_static_page(driver, static_page_no):
    base_url = "https://www.compuzone.co.kr/product/"
    qs1 = "productB_new_list.htm?actype=getPaging"
    qs2 = "&SelectProductNo=&orderlayerx=&orderlayery=&BigDivNo=1"
    page_count = "&PageCount=20"
    start_num = f"&StartNum={(static_page_no - 1) * 20}"
    page_num = f"&PageNum={static_page_no}"
    qs3 = "&PreOrder=recommand&lvm=L&ps_po=P&DetailBack=&CompareProductNoList="
    qs4 = "&CompareProductDivNo=&IsProductGroupView=&ScrollPage=3&ProductType=biglist&setPricechk=&SchMinPrice="
    qs5 = "&SchMaxPrice=&sel_mediumdiv=%C1%DF%BA%D0%B7%F9&sel_div=%BC%D2%BA%D0%B7%F9&select_page_cnt=60"
    full_url = base_url + qs1 + qs2 + page_count + start_num + page_num + qs3 + qs4 + qs5
    # 드라이버 실행
    driver.get(full_url)


class ProductModel:
    """
    제품 모델 클래스.
    => spec 객체를 만들기 위한 모델입니다.
    => setter는 두 개의 원소가 들어가는 tuple(또는 list) 형태의 값을 받습니다.
    => 0번째 원소가 key, 1번째 원소가 value로 설정됩니다.

    Date: 2023. 09. 26
    Class: Product Model Class
    Author: HyeonDong Moon
    """

    def __init__(self):
        # 중복되는 정보를 append를 통해 최대한 넣기 위해 value를 리스트 형식으로 지정했다.
        self.__spec = {
            "mainboard": [],
            "cpu": [],
            "vga": [],
            "ram": [],
            "storage": [],
            "powersupply": [],
            "price": 0,
            "link": "",
        }

    @property
    def spec(self):
        return self.__spec

    @spec.setter
    def spec(self, value):
        if value[0] == "link" or value[0] == "price":
            self.__spec[value[0]] = value[1]
        else:
            self.__spec[value[0]].append(value[1])


class SubtextAnalyzing:
    """
    서브텍스트 분석 클래스.
    => 셀레니움 원소 형태의 subtext를 분해해서 부품 정보를 찾고,
    그것으로 spec 객체를 만드는 클래스입니다.

    Date: 2023. 09. 26
    Class: Subtext Analyzing Class
    Author: HyeonDong Moon
    """

    def __init__(self, subtext_element):
        self.__subtext_element = subtext_element

    # 분해된 텍스트로부터 부품정보 추출
    @staticmethod
    def analyze_text(subtext: str):
        maping_list = {
            0: "mainboard",
            1: "cpu",
            2: "vga",
            3: "ram",
            4: "storage",
            5: "powersupply",
        }
        # 아래는 확실하게 구분할 수 있는 키워드들
        checklist = {
            0: ["amd"],
            1: [
                "라이젠",
                "ryzen",
                "i3",
                "i5",
                "i7",
                "i9",
                "애슬론",
                "athlon",
                "펜티엄",
                "pentium",
                "셀러론",
                "celeron",
            ],
            2: ["지포스", "geforce", "라데온", "radeon", "내장"],
            3: ["ram", "ddr"],
            4: ["ssd", "hdd"],
            5: ["정격"],
        }
        # 만약 인텔 관련 키워드가 나오는 경우,
        # 메인보드와 cpu 둘 다 '인텔'로 쓰는 경향이 있기 때문에 구분해야 한다.
        if ("인텔" or "intel") in subtext:
            intel_cpu = ["코어", "세대", "i"]
            for cpu_word in intel_cpu:
                # 안에 '코어', '세대', (i3부터 i9사이를 나타내는)'i'가 나온다면 그것은 인텔 cpu로 본다.
                if cpu_word in subtext:
                    return maping_list[1], subtext.strip()
            # 그렇지 않으면 인텔 메인보드로 본다.
            return maping_list[0], subtext.strip()

        # 나머지는 확실하게 구분할 수 있으므로 for문으로 하나씩 찾으면 된다.
        for i in range(6):
            for checktext in checklist[i]:
                # 만약 텍스트가 체크리스트와 일치하는 것이 있다면,
                if checktext in subtext:
                    # 튜플로 반환한다.
                    return maping_list[i], subtext.strip()

        # 아무것도 일치하지 않으면 반환값은 없다.
        return None

    # 셀레니움 원소 형태의 subtext를 분해
    def __split_subtext(self):
        # 실제 subtext
        subtext = self.__subtext_element.text.lower()
        # subtext 분해
        texts = subtext.split("/")
        return texts

    # 분해된 subtext를 분석
    def __analyze_subtext(self):
        prd_model = ProductModel()
        for text in self.__split_subtext():
            result = self.analyze_text(text)
            # result는 튜플이다.
            # 0번째 원소는 문자열로 된 키(부품 종류)
            # 1번째 원소는 문자열로 된 값(부품 이름)
            if result:
                # spec객체 생성
                prd_model.spec = result
        return prd_model

    def run(self):
        return self.__analyze_subtext()


class CompuzoneCrawler:
    """
    컴퓨존 크롤러 클래스.
    --------------------------------------------------------------------------------

    기본 사용법:

    1. 클래스를 초기화할 때 아래와 같이 번호를 지정할 수 있습니다.
    => crawler = CompuzoneCrawler(10)

    2. 이렇게 하면 첫 페이지에서 해당 페이지 까지를 탐색합니다.
    (__find_subtext_in_page 메서드가 여러번 실행되면서 탐색합니다.)
    3. 만약 숫자를 지정하지 않으면, 기본적으로 맨 처음 페이지만 탐색합니다.
    => crawler = CompuzoneCrawler()

    4. 결과는 이렇게 가져올 수 있습니다.
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
                self.__page_no = page_no
                self.__results = {}
                self._driver = self.__make_driver()
        except TypeError as error:
            raise TypeError(str(error))
        except ValueError as error:
            raise ValueError(str(error))

    # 드라이버 만들기
    @staticmethod
    def __make_driver():
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--disable-gpu")
        options.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
        )
        driver = webdriver.Chrome(
            # service=Service(executable_path=ChromeDriverManager().install()),
            # (아래와 같이)경로를 명시적으로 설정해주지 않으면 실행시 각종 에러가 난다.
            service=Service(executable_path="C:/Users/mhd32/.wdm/drivers/chromedriver/win64/117.0.5938.89/chromedriver-win32/chromedriver.exe"),
            options=options,
        )
        return driver

    # 서브텍스트를 찾고 그것으로 spec객체 만들기
    def __find_subtext_in_page(self, target_page_no):
        start_time = time.time()
        prd_list = []
        subtext_elements = None
        make_dynamic_element_in_static_page(self._driver, target_page_no)
        # 위의 함수가 성공적으로 실행 => 현재 대상 페이지가 켜져있는 상태임
        try:
            # 동적 요소가 렌더링된 대상 페이지에서 product_list_ul을 찾는다.
            product_list = self._driver.find_element(By.ID, "product_list_ul")
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
                self._driver.find_element(By.TAG_NAME, "body").send_keys(Keys.PAGE_DOWN)
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
                    # 분석된 객체 생성
                    analyzing = SubtextAnalyzing(subtext_elements[i])
                    analyzing_result = analyzing.run()
                    analyzing_result.spec = "link", prd_link
                    analyzing_result.spec = "price", prd_price
                    prd_list.append(analyzing_result.spec)
        # 모든 예외 발생시 드라이버를 종료해줘야 한다.
        except:
            self._driver.quit()
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
        self._driver.quit()
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
