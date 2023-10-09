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