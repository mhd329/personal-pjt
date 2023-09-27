import os
import time
import pickle
from dotenv import load_dotenv
from modules.crawler import CompuzoneCrawler
from concurrent.futures import ProcessPoolExecutor
from flask import Flask, render_template, Response, jsonify


load_dotenv()
app = Flask(__name__)


# 크롤러를 멀티프로세싱 하기 위해 필요한 함수
# 각 프로세서는 크롤러 객체를 만들고 멀티프로세싱 후 결과를 반환한다.
def crawl_wide(exp_range):
    crawler = CompuzoneCrawler(exp_range)
    crawler.crawl_with_multiprocessing()
    res = crawler.get_results()
    return res


@app.route("/")
def index():
    return render_template("index.html")


# 간이 검색 (1페이지)
@app.route("/basic-explore/")
def simple_explore():
    start = time.time()
    crawler = CompuzoneCrawler()
    # 크롤링 결과를 직렬화
    response = jsonify(crawler.get_results())
    end = time.time()
    # 약 8.5초 이상
    print(f"simple_explore: 전체 {end - start}초 소요됨")
    return response


# 전체 검색 (1페이지 ~ 10페이지)
@app.route("/wide-explore/<int:exp_range>/")
def wide_explore(exp_range):
    start = time.time()
    crawler = CompuzoneCrawler(exp_range)
    
    # for문으로 크롤링
    # crawler.crawl_with_for()
    # results = crawler.get_results()

    # 멀티쓰레딩
    # crawler.crawl_with_multithreading()
    # results = crawler.get_results()
    
    # 멀티프로세싱
    with ProcessPoolExecutor(max_workers=20) as excutor:
        results = excutor.map(crawl_wide, [*range(1, exp_range + 1)])
    
    # 크롤링 결과를 직렬화
    response = jsonify([*results])
    end = time.time()

    print(f"wide_explore: 전체 {end - start}초 소요됨")
    return response


# 개발 환경에서는 자동으로 DEBUG=True로 작동함
if __name__ == "__main__":
    app.run(port=5000, debug=os.getenv("DEBUG") == "True")
