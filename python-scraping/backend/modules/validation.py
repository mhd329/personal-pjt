# 유효성 검증 함수
def is_valid(page_no):
    if not isinstance(page_no, int):
        raise TypeError("The explored range must be integer.")
    if page_no < 1:
        raise ValueError("Starting index must be equal to or greater than 1.")
    return True
