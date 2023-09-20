import os
from dotenv import load_dotenv
from modules.crawler import CompuzoneCrawler
from flask import Flask, render_template, Response, jsonify


load_dotenv()
app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


# 간이 검색 (1페이지)
@app.route("/basic-explore/")
def simple_explore():
    crawler = CompuzoneCrawler()
    # 크롤링 결과를 직렬화
    return crawler.get_results()


# 전체 검색 (1페이지 ~ 10페이지)
@app.route("/wide-explore/<int:exp_range>/")
def wide_explore(exp_range):
    crawler = CompuzoneCrawler(exp_range)
    # 크롤링 결과를 직렬화
    result = jsonify(crawler.get_results())
    data = {
        "message": "success",
        "result": result,
    }
    # css selector #product_list_ul 하위의 것들
    return Response(
        data,
        status=200,
        content_type="application/json",
    )


# 개발 환경에서는 자동으로 DEBUG=True로 작동함
if __name__ == "__main__":
    app.run(port=5000, debug=os.getenv("DEBUG") == "True")
