from backend.db.model import ProductModel


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

    # 셀레니움 탐색 결과, 원소 형태의 subtext를 분해
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
