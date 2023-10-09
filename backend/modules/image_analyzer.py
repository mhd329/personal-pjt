import os
import re
import cv2
import time
import pytesseract
import numpy as np
from konlpy.tag import Komoran
from concurrent.futures import ThreadPoolExecutor


# 이미지 경로 설정 클래스
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


# 이미지 전처리 클래스
class ImagePreprocessing(ImagePath):
    """
    이미지 전처리 클래스.
    => 설정한 경로에 전처리된 이미지를 생성합니다.
    => 텍스트 추출 전 정확성을 높이기 위해 사용됩니다.

    Date: 2023. 09. 20
    Class: Image Preprocessing Class
    Author: HyeonDong Moon
    """

    def __init__(self, image_path: str = None):
        super().__init__(image_path)

    def __execute_sharpening(self, image_name, img_file):
        origin_image = cv2.imread(img_file)
        gray_image = cv2.cvtColor(origin_image, cv2.COLOR_BGR2GRAY)
        # 중앙값 5 샤프닝
        sharpening_mask = np.array(
            [
                [0, -1, 0],
                [-1, 5, -1],
                [0, -1, 0],
            ]
        )
        sharpening_out = cv2.filter2D(gray_image, -1, sharpening_mask)
        cv2.imwrite(
            f"{self._image_path}/preprocessing_images/{image_name}_sharpening.jpg",
            sharpening_out,
        )

    def __execute_preprocessing(self):
        if self._image_list:
            for img_name in self._image_list:
                img_file = self._image_path + img_name
                if os.path.isfile(img_file):
                    self.__execute_sharpening(img_name, img_file)

    def run(self):
        self.__execute_preprocessing()


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
        # 품사 필터링
        self.__pos_condition = ["NNP", "SL", "SN", "SF"]
        self.__results = {}

    # 메서드화 예쩡
    # def __check_pattern(self, part: str, pattern: str):

    # 패턴을 어떻게 추출해야 할지 고민이다.
    def __analyze_text(self, text_fragment: str):
        # CPU 정보 추출
        cpu_pattern = r"^(1\d{4}[a-zA-Z]{0,2}|[0-9]{4}(?:[a-zA-Z]{1,3})?)$"
        cpu_match = re.search(cpu_pattern, text_fragment, re.IGNORECASE)
        if cpu_match:
            if "CPU" in self.__results:
                self.__results["CPU"].append(cpu_match.group())
            else:
                self.__results["CPU"] = [cpu_match.group()]

        # 메인보드 정보 추출
        mainboard_pattern = r"메인보드|메인 보드"
        mainboard_match = re.search(mainboard_pattern, text_fragment, re.IGNORECASE)
        if mainboard_match:
            if self.__results["MAINBOARD"]:
                self.__results["MAINBOARD"].append(mainboard_match.group())
            else:
                self.__results["MAINBOARD"] = [mainboard_match.group()]

        # RAM 정보 추출
        ram_pattern = r"RAM|메모리 (\d+\s*[gbmMG]+ DDR[2-4]+)"
        ram_match = re.search(ram_pattern, text_fragment, re.IGNORECASE)
        if ram_match:
            if self.__results["RAM"]:
                self.__results["RAM"].append(ram_match.group())
            else:
                self.__results["RAM"] = [ram_match.group()]

        # 저장소 정보 추출
        storage_pattern = r"SSD|HDD|저장장치 (\d+\s*[gbmMG]+ [^\s]+)"
        storage_match = re.search(storage_pattern, text_fragment, re.IGNORECASE)
        if storage_match:
            if self.__results["STORAGE"]:
                self.__results["STORAGE"].append(storage_match.group())
            else:
                self.__results["STORAGE"] = [storage_match.group()]

        # VGA 정보 추출
        vga_pattern = r"VGA|그래픽|그래픽 카드 ([^\s]+)"
        vga_match = re.search(vga_pattern, text_fragment, re.IGNORECASE)
        if vga_match:
            if self.__results["VGA"]:
                self.__results["VGA"].append(vga_match.group())
            else:
                self.__results["VGA"] = [vga_match.group()]

        # 파워 정보 추출
        power_pattern = r"Power Supply|파워 서플라이 (\d+\s*[wW]+)"
        power_match = re.search(power_pattern, text_fragment, re.IGNORECASE)
        if power_match:
            if self.__results["POWER"]:
                self.__results["POWER"].append(power_match)
            else:
                self.__results["POWER"] = [power_match.group()]

    # I/O 작업을 멀티쓰레드 방식으로 처리하는 메서드
    def __analyze_image(self, image_name: str):
        entities = []
        entity_buffer = []
        elements_na = []
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
        # => 이 부분은 동시성 프로그래밍을 할 수 없다고 생각했다.
        # => 왜냐하면 문장의 처음부터 읽어나가며 순서를 맞춰야하기 때문이다.
        for word, pos in ner_text:
            # 이미지 변환 결과가 이상할 때도 있어서 마지막에 "NA" list를 한번 더 검사해야 한다.
            if pos == "NA":
                elements_na.append(word)
            # 어떤 품사가 필터링에 해당하면,
            if pos in self.__pos_condition:
                # 버퍼에 추가
                entity_buffer.append(word)
            # 필터링에 해당하지 않는 품사라면,
            else:
                # 만약 버퍼가 차있던 경우,
                if entity_buffer:
                    # 버퍼의 모든 내용을 결합한 다음 엔티티에 추가하고
                    entities.append(" ".join(entity_buffer))
                    # 버퍼를 비운다.
                    entity_buffer = []
        # 끝까지 다 돌고 나면 버퍼에 대한 검사를 한번 더 해야한다. 조건에 해당한 채로 for문이 종료되면 검사를 수행하지 않고 반복문이 끝나기 때문이다.
        if entity_buffer:
            entities.append(" ".join(entity_buffer))

        # 이 아래는 엔티티로부터 부품 정보 추출
        # 멀티프로세스? 멀티쓰레드?
        with ThreadPoolExecutor(max_workers=10) as excutor:
            excutor.map(self.__analyze_text, entities)

        end_time = time.time()
        print(f"결과: {end_time - self.start_time}")
        print(elements_na)
        print(entities)
        print(self.__results)
        # 그냥 for문을 사용하면 고작 3개 처리하는데 8.5초 이상 걸리고 있다.
        # ThreadPoolExecutor를 사용하니 4초 초반으로 줄었다.

    def __extract_text_from_image(self):
        if self._image_list:
            self.start_time = time.time()
            with ThreadPoolExecutor(max_workers=len(self._image_list)) as excutor:
                excutor.map(self.__analyze_image, self._image_list)

    def run(self):
        self.__extract_text_from_image()


base_path = "../static/image"

# # 이미지 전처리
# img_preprocessing = ImagePreprocessing(base_path)
# img_preprocessing.run()
#
# # 전처리된 이미지 분석
# analyzing_spec = AnalyzingSpec(f"{base_path}/preprocessing_images")
# analyzing_spec.run()
