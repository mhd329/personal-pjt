import os
import cv2
import pytesseract
from konlpy.tag import Komoran


class FilePath:
    """
    경로 설정을 위한 클래스.

    Date: 2023. 09. 20
    Class: Image Preprocessing Class
    Author: HyeonDong Moon
    """

    def __init__(self, file_path: str = None):
        if not file_path:
            raise TypeError("파일의 경로를 설정해주세요.")
        # 경로 끝에는 항상 슬래시를 붙여줘야 한다.
        self._file_path = file_path
        self._file_list = os.listdir(file_path)


class PreprocessedImage(FilePath):
    """
    이미지 전처리 클래스.
    => 설정한 경로에 전처리된 이미지를 생성합니다.

    Date: 2023. 09. 20
    Class: Image Preprocessing Class
    Author: HyeonDong Moon
    """

    def __init__(self, file_path: str = None):
        super().__init__(file_path)

    def _preprocess_image(self):
        if self._file_list:
            for fn in self._file_list:
                origin_image = cv2.imread(self._file_path + fn)
                rgb_image = cv2.cvtColor(origin_image, cv2.COLOR_BGR2RGB)
                cv2.imwrite(f"./BGR2RGB_images/{fn}.jpg", rgb_image)


class ComputerSpec(FilePath):
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
    pytesseract.pytesseract.tesseract_cmd = (
        r"D:/Program Files/Tesseract-OCR/tesseract.exe"
    )

    def __init__(self, file_path: str = None):
        super().__init__(file_path)
        self.pos_na = []
        self.entities = []
        self.entity_buffer = []
        self.condition = ["NNP", "SL", "SN", "SF"]

    def _extract_text_from_image(self):
        if self._file_list:
            for fn in self._file_list:
                # 분할 모드는 단어, 단어 사이의 공백은 유지
                raw_text = pytesseract.image_to_string(
                    fn,
                    lang="ENG+KOR",
                    config="--psm 4 -c preserve_interword_spaces=1",
                )
                kr_text = raw_text.strip().replace("\n", " ")
                kr_text = " ".join(komoran.morphs(kr_text))
                ner_res = komoran.pos(kr_text.lower())


# 모든 형태소에 대해 분석
for word, pos in ner_res:
    if pos == "NA":
        pos_na.append(word)
    # 만약 어떤 품사가 조건에 해당하면,
    if pos in condition:
        # 버퍼에 추가
        entity_buffer.append(word)
    # 조건에 해당하지 않는 품사가 나오기 시작하면,
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

# print(entities)
print(pos_na)
# print(entity_buffer)
