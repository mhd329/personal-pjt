import os
from dotenv import load_dotenv
from modules.crawler import CompuzoneCrawler
from flask import Flask, render_template


load_dotenv()
app = Flask(__name__)


@app.route("/")
def index():
    return render_template('index.html')


# 간이 검색 (1페이지)
@app.route("/basic-explore/")
def simple_explore():
    crawler = CompuzoneCrawler()
    # 링크에서 PageNum 1로 고정.
    return "기본 탐색"


# 전체 검색 (1페이지 ~ 10페이지)
@app.route("/wide-explore/<int:exp_range>/")
def wide_explore(exp_range):
    crawler = CompuzoneCrawler(exp_range)
    # 링크에서 PageNum을 1부터 정해진 끝까지 바꿔주면서 탐색.
    # css selector #product_list_ul 하위의 것들
    return "전체 탐색"


# 개발 환경에서는 자동으로 DEBUG=True로 작동함
if __name__ == "__main__":
    app.run(port=5000, debug=os.getenv("DEBUG") == "True")
