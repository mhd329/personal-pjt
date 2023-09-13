import os
from flask import Flask
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)


@app.route("/")
def index():
    return "인덱스 페이지"


@app.route("/simple-search/")
def simple_search():
    # 컴퓨존 기준 탐색
    # https://www.compuzone.co.kr/product/productB_new_list.htm?actype=getPaging&SelectProductNo=&orderlayerx=&orderlayery=&BigDivNo=1&PageCount=20&StartNum=40&PageNum=1&PreOrder=recommand&lvm=L&ps_po=P&DetailBack=&CompareProductNoList=&CompareProductDivNo=&IsProductGroupView=&ScrollPage=3&ProductType=biglist&setPricechk=&SchMinPrice=&SchMaxPrice=&sel_mediumdiv=%C1%DF%BA%D0%B7%F9&sel_div=%BC%D2%BA%D0%B7%F9&select_page_cnt=60
    # 위 링크에서 PageNum은 1로 고정.
    return "탐색 시작"


@app.route("/powerful-search/")
def powerful_search():
    # https://www.compuzone.co.kr/product/productB_new_list.htm?actype=getPaging&SelectProductNo=&orderlayerx=&orderlayery=&BigDivNo=1&PageCount=20&StartNum=40&PageNum=4&PreOrder=recommand&lvm=L&ps_po=P&DetailBack=&CompareProductNoList=&CompareProductDivNo=&IsProductGroupView=&ScrollPage=3&ProductType=biglist&setPricechk=&SchMinPrice=&SchMaxPrice=&sel_mediumdiv=%C1%DF%BA%D0%B7%F9&sel_div=%BC%D2%BA%D0%B7%F9&select_page_cnt=60
    # 위 링크에서 PageNum을 바꿔주면서 계속 탐색해야 한다.
    # #product_list_ul 하위의 것들
    return ""


app.run(port=5000, debug=os.getenv("DEBUG") is True)
