import os
import time
import pytesseract
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
from konlpy.tag import Komoran


class ImagePath:
    """
    경로 설정을 위한 클래스.

    Date: 2023. 09. 20
    Class: Image Preprocessing Class
    Author: HyeonDong Moon
    """

    def __init__(self, image_path: str = None):
        if not image_path:
            raise TypeError("파일의 경로를 설정해주세요.")
        if os.path.isdir(image_path):
            # 경로 끝에는 항상 슬래시를 붙여줘야 한다.
            if image_path[-1] != "/":
                image_path = image_path + "/"
            self._image_path = image_path
            self._image_list = os.listdir(image_path)
        else:
            raise FileNotFoundError("경로를 찾을 수 없습니다.")


class AnalyzingSpec(ImagePath):

    """
    전처리된 이미지에서 텍스트를 추출하는 클래스.
    => 텍스트를 가지고 컴퓨터 스펙 객체를 만듭니다.

    Date: 2023. 09. 20
    Class: Image Preprocessing Class
    Author: HyeonDong Moon
    """

    # 클래스 변수로 komoran 인스턴스 할당
    komoran = Komoran()
    # tesseract.exe 경로 설정
    # 배포 이후 올바른 경로로 수정해주어야 한다.
    pytesseract.pytesseract.tesseract_cmd = (
        r"D:/Program Files/Tesseract-OCR/tesseract.exe"
    )

    def __init__(self, image_path: str = None):
        super().__init__(image_path)
        self._pos_na = []
        self._entities = []
        self._entity_buffer = []
        self._condition = ["NNP", "SL", "SN", "SF"]

    def _analyze_image(self, image_name: str):
        # 영자 + 한글의 조합
        # 분할 모드는 단어
        # 단어 사이의 공백은 유지
        raw_text = pytesseract.image_to_string(
            f"{self._image_path}/{image_name}",
            lang="ENG+KOR",
            config="--psm 4 -c preserve_interword_spaces=1",
        )
        # 원본 줄바꿈 제거
        no_newline_text = raw_text.strip().replace("\n", " ")
        # 원본을 형태소 단위로 분해하고 품사 단위로 인식
        ner_text = AnalyzingSpec.komoran.pos(no_newline_text.lower())
        # 모든 형태소에 대해 분석
        for word, pos in ner_text:
            if pos == "NA":
                self._pos_na.append(word)
            # 만약 어떤 품사가 조건에 해당하면,
            if pos in self._condition:
                # 버퍼에 추가
                self._entity_buffer.append(word)
            # 조건에 해당하지 않는 품사가 나오기 시작하면,
            else:
                # 만약 버퍼가 차있던 경우,
                if self._entity_buffer:
                    # 버퍼의 모든 내용을 결합한 다음 엔티티에 추가하고
                    self._entities.append(" ".join(self._entity_buffer))
                    # 버퍼를 비운다.
                    entity_buffer = []
        # 끝까지 다 돌고 나면 버퍼에 대한 검사를 한번 더 해야한다. 조건에 해당한 채로 for문이 종료되면 검사를 수행하지 않고 반복문이 끝나기 때문이다.
        if self._entity_buffer:
            self._entities.append(" ".join(self._entity_buffer))

        print(self._entities)
        end_time = time.time()
        print("결과: %f" % (end_time - self.start_time))  # 고작 3개 처리하는데 8초나 걸리고 있다.
        # print(self._pos_na)
        # print(self._entity_buffer)

    def _extract_text_from_image(self):
        if self._image_list:
            self.start_time = time.time()

            with ProcessPoolExecutor() as excutor:
                excutor.map(self._analyze_image, self._image_list)

    def run(self):
        self._extract_text_from_image()


analyzing_spec = AnalyzingSpec("../static/image")
analyzing_spec.run()
