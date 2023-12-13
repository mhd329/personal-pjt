import os
import time
from dotenv import load_dotenv
from flask_caching import Cache
from modules.crawler import DanawaCrawler
from concurrent.futures import ProcessPoolExecutor
from flask import Flask, render_template, Response, jsonify


# 스케줄된 작업을 처리하는 별도의 서버를 구성할지, 본 서버에서 멀티프로세싱을 할지 고민
# 선택에 따라 redis 캐시스토어를 어떻게 구성할지가 달라진다.


load_dotenv()
server = Flask(__name__, static_url_path="/static/")
# django secret key generator 사용함
server.secret_key = os.getenv("SECRET_KEY")


# 크롤러를 멀티프로세싱 하기 위해 필요한 함수
# 각 프로세서는 크롤러 객체를 만들고 멀티프로세싱 후 결과를 반환한다.
def crawl_wide(exp_range):
    crawler = DanawaCrawler(exp_range)
    crawler.crawl_with_multiprocessing()
    res = crawler.get_results()
    return res


@server.route("/")
def index():
    return render_template("index.html")


# 간이 검색 (1페이지)
@server.route("/basic-explore/")
def simple_explore():
    start = time.time()
    crawler = DanawaCrawler()
    # 크롤링 결과를 직렬화
    response = jsonify(crawler.get_results())
    end = time.time()
    # 약 8.5초 이상
    print(f"simple_explore: 전체 {end - start}초 소요됨")
    return response


# 전체 검색 (1페이지 ~ 10페이지)
@server.route("/wide-explore/<int:exp_range>/")
def wide_explore(exp_range):
    start = time.time()
    response = {}
    # crawler = DanawaCrawler(exp_range)
    
    # for문으로 크롤링
    # crawler.crawl_with_for()
    # results = crawler.get_results()

    # 멀티쓰레딩
    # crawler.crawl_with_multithreading()
    # results = crawler.get_results()

    # 멀티프로세싱
    with ProcessPoolExecutor(max_workers=24) as excutor:
        # results는 generator object
        # 한 번 풀어야 함
        results = excutor.map(crawl_wide, [*range(1, exp_range + 1)])

    for dict_obj in results:
        # k = list(dict_obj.keys())
        # v = list(dict_obj.values())
        # response[k[0]] = v[0]
        for k, v in dict_obj.items():
            response[k] = v

    # 크롤링 결과를 직렬화
    response = jsonify(response)
    end = time.time()

    print(f"wide_explore: 전체 {end - start}초 소요됨")
    return response


# 개발 환경에서는 자동으로 DEBUG=True로 작동함
if __name__ == "__main__":
    server.run(port=5000, debug=os.getenv("DEBUG") == "True")
