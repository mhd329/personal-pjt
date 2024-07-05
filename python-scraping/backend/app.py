import os
import time
from modules import Driver
from dotenv import load_dotenv
from modules.scraper import DanawaScraper
from concurrent.futures import ProcessPoolExecutor
from flask import Flask, render_template, Response, jsonify, stream_with_context

# 다나와 기본 URL

components: list[str] = ["CPU", "MAINBOARD"] # CPU, Mainboard 멀티프로세싱 -> page 멀티쓰레딩

load_dotenv()
server = Flask(__name__, static_url_path="/static/")
# django secret key generator 사용함
server.secret_key = os.getenv("SECRET_KEY")


# 스크래퍼를 멀티프로세싱 하기 위해 필요한 함수.
# 크롬의 작동방식은 멀티프로세싱 방식이므로,
# CPU scraping, Mainborad scraping 두 작업을 수행할 프로세서들을 할당한다.
def make_scraper(components):
    """
    각 프로세서는 페이지 탐색을 위한 자식 쓰레드들을 만들고 멀티쓰레딩 후 결과를 반환한다.
    """
    # driver = Driver("--headless", "--disable-gpu").make_driver()
    driver = Driver().make_driver()
    scraper = DanawaScraper(driver, components)
    scraper.run()
    return scraper.results


@server.route("/")
def index():
    return render_template("index.html")


# 검색
@server.route("/run-scraping/")
def run():
    time_start = time.time()
    response = []
    def mp_run():
        with ProcessPoolExecutor(max_workers=2) as excutor:
            yield excutor.map(make_scraper, components)
    return Response(stream_with_context(mp_run()))
    # response = jsonify(results)
    # time_end = time.time()
    # print(f"scraping: 전체 {time_end - time_start}초 소요됨")
    # return response

# 개발 환경에서는 자동으로 DEBUG=True로 작동함
if __name__ == "__main__":
    # 맥은 airplay라는 것에서 5000번 포트를 사용하므로 다른 포트를 사용해야 함.
    server.run(port=5001, debug=os.getenv("DEBUG") == "True")
