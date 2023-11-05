import time
from modules import Driver
from modules.scraper import DanawaScraper
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

# 다나와 기본 URL

components: list[str] = ["CPU", "MAINBOARD"] # CPU, Mainboard 멀티프로세싱 -> page 멀티쓰레딩

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
    print(f"test : {__name__}")
    results_main = scraper.main()
    scraper.driver.quit()
    return results_main

# 검색
def run():
    time_start = time.time()
    # response = []
    with ProcessPoolExecutor(max_workers=2) as excutor:
        result = excutor.map(make_scraper, components)
    # response = jsonify(results)
    time_end = time.time()
    print(f"scraping: 전체 {time_end - time_start}초 소요됨")
    return result

if __name__ == "__main__":
    res = run()
    for i in res:
        print(i)