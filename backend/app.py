import os
import time
from modules import Driver
from dotenv import load_dotenv
from flask_caching import Cache
from modules.scraper import DanawaScraper
from concurrent.futures import ProcessPoolExecutor
from flask import Flask, render_template, Response, jsonify

# 다나와 기본 URL

components: list[str] = ["cpu", "mainboard"] # CPU, Mainboard 멀티프로세싱 -> page 멀티쓰레딩

load_dotenv()
server = Flask(__name__, static_url_path="/static/")
# django secret key generator 사용함
server.secret_key = os.getenv("SECRET_KEY")

# 스크래퍼를 멀티프로세싱 하기 위해 필요한 함수.
# 크롬의 작동방식은 멀티프로세싱 방식이므로,
# CPU scraping, Mainborad scraping 두 작업을 수행할 프로세서들을 할당한다.
def make_processor(components):
    """
    각 프로세서는 페이지 탐색을 위한 자식 쓰레드들을 만들고 멀티쓰레딩 후 결과를 반환한다.
    """
    driver = Driver("--headless", "--disable-gpu").make_driver()
    scraper = DanawaScraper(driver, components)
    crawler.crawl_with_multiprocessing()
    res = crawler.get_results()
    return res


@server.route("/")
def index():
    return render_template("index.html")


# 간이 검색 (1페이지)
@server.route("/basic-explore/")
def simple_explore():
    time_start = time.time()
    crawler = DanawaCrawler()
    crawler.do_crawling()
    # 크롤링 결과
    result = crawler.get_results()
    # 결과를 직렬화
    response = jsonify(result)
    time_end = time.time()
    # 약 8.5초 이상
    print(f"simple_explore: 전체 {time_end - time_start}초 소요됨")
    return response


# # 전체 검색 (1페이지 ~ 10페이지)
# @server.route("/wide-explore/<int:exp_range>/")
# def wide_explore():
#     start = time.time()
#     response = {}
#     # crawler = DanawaCrawler(exp_range)

#     # for문으로 크롤링
#     # crawler.crawl_with_for()
#     # results = crawler.get_results()

#     # 멀티쓰레딩
#     # crawler.crawl_with_multithreading()
#     # results = crawler.get_results()

# 멀티프로세싱을 위한 이름공간 만들기
with ProcessPoolExecutor(max_workers=2) as excutor:
    # results는 generator object
    # 한 번 풀어야 함
    results = excutor.map(make_processor, url_list)

#     for dict_obj in results:
#         # k = list(dict_obj.keys())
#         # v = list(dict_obj.values())
#         # response[k[0]] = v[0]
#         for k, v in dict_obj.items():
#             response[k] = v

#     # 크롤링 결과를 직렬화
#     response = jsonify(response)
#     end = time.time()

#     print(f"wide_explore: 전체 {end - start}초 소요됨")
#     return response


# 개발 환경에서는 자동으로 DEBUG=True로 작동함
if __name__ == "__main__":
    # 맥은 airplay라는 것에서 5000번 포트를 사용하므로 다른 포트를 사용해야 함.
    server.run(port=5001, debug=os.getenv("DEBUG") == "True")
