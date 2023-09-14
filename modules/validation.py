def isvalid(start, last):
    if start:
        if not isinstance(start, int):
            raise TypeError("The explored range must be integer.")
        if start < 1:
            raise ValueError("Starting index must be equal to or greater than 1.")
        if last:
            if not isinstance(last, int):
                raise TypeError("Last index must be integer.")
            if last < start:
                raise ValueError("Last index must be equal to or greater than the starting index.")
    return True
