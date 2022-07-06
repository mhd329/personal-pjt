# 만든지 오래되서 기억이 잘 안난다...
# 주석의 중요성을 실감하는 계기가 되었다.
# 기본 뼈대 파일을 여러번 복사하여 어떤 칸의 내용만 특정 내용으로 바꿔준디음 저장하는 매크로

# 한글 2007 기준
# 표의 어떤 칸을 찾고 그 다음칸에 어떤 문자열을 넣는 기능
# 예를 들어서 표의 어떤 칸이 '성명' 칸이면 그 다음 빈칸에 각 학생의 이름을 넣는 매크로

import os
import shutil
import win32com.client as win32

# 새 한글 문서를 열기

hwp = win32.gencache.EnsureDispatch("HWPFrame.HwpObject")
hwp.RegisterModule('FilePathCheckDLL', 'SecurityModule')

# 예를들어 학생들 이름으로 리스트를 만들면 그 이름대로 폴더가 만들어짐

students_list_01 = []
students_list_02 = []

# 경로 설정하기
# make.py 가 있는 절대경로

BASE_DIR = os.path.dirname(os.path.abspath("make.py"))

# 변경을 원하는 칸을 찾는 코드
# 커서를 해당 칸으로 옮겨준다.

def find_cell(): # 찾을 문자열이 들어있는 칸을 찾는 함수
    hwp.MovePos(2)
    hwp.InitScan()
    while True :
        hwp.MovePos(101)
        textdata = hwp.GetText()
        index = textdata[1].strip()
        if index.replace(" ", "") == '찾을 문자열': # 칸의 내용이 찾을 문자열이면
            hwp.MovePos(101) # 커서를 그 바로 다음칸으로 이동
            break 
        else:
            hwp.MovePos(201) # 찾을 때 까지 작동
        
    hwp.ReleaseScan()

# 릴리즈스캔을 해서 초기화를 해주어야 한다.

def insert_text(name): # 찾은 칸에 문자열 넣기
    act = hwp.CreateAction("InsertText")
    pset = act.CreateSet()
    pset.SetItem("Text", name)
    act.Execute(pset)

def replace(name): # 칸을 찾고 내용 넣은다음 저장 후 종료하기 기능을 합친 함수
    find_cell()
    insert_text(name)
    hwp.Clear(3)

# 만든 파일을 저장할 경로 만들기, 바꾸기

os.chdir(os.path.join(BASE_DIR, "문서들을 저장할 폴더 이름"))

for i in range(1,3): # 원하는 만큼 숫자를 넣을 수 있다.
    os.mkdir('0' + str(i)) # 0n 까지 폴더를 만든다.
    ClassDiv = os.listdir() # 01~02 ... 0n 으로 만들어진 폴더들을 리스트로 해서 구분한다.
    
for n in ClassDiv: # 각 0n 폴더로 들어가기
    os.chdir(os.path.join(os.getcwd(), n))
    if n == '01':
        for name in students_list_01:
            shutil.copytree((os.path.join(BASE_DIR, '뼈대가 되는 원본 파일의 이름')), name)
        os.chdir('..')
        
    if n == '02':
        for name in students_list_02:
            shutil.copytree((os.path.join(BASE_DIR, '뼈대가 되는 원본 파일의 이름')), name)
        os.chdir('..')

# 사본 파일을 저장할 장소에 파일 저장

def run():
    os.chdir(os.path.join(BASE_DIR, "저장소"))
    ClassDiv = os.listdir() # 01, 02 ... 0n

    for n in ClassDiv:
        os.chdir(os.path.join(os.getcwd(), n)) # 01
        students = os.listdir() # 홍길동, 문현동 ...

        for name in students:
            os.chdir(os.path.join(os.getcwd(), name)) # 홍길동
            fileList = os.listdir()
            hwpFiltering = [file for file in fileList if file.endswith(".hwp")]

            for files in hwpFiltering:
                hwp.Open(os.path.join(os.getcwd(), files))
                replace(name)
                hwp.Clear(3)
                
            os.chdir('..')

        os.chdir('..')

run()

hwp.Quit()

# 시간에 쫒겨서 투박한 모양인데 다듬을 곳이 많아보인다.
# 특히 for 문을 활용한 반복부분에 개선할 점이 많은 것 같다.
# 코드를 조금 수정하면 다른 곳에 활용 할 수 있을 것 같다.
# class 활용해서 뼈대를 더 튼튼히 설계 할 수 있을 것 같다.
# for 문 말고 다른 방법으로 매크로를 만들 수 있는지 고민해보면 좋을 것 같다.