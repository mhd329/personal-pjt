import os
import time
import json
from modules import Driver
from modules.scraper import DanawaScraper
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

# CPU, Mainboard 멀티프로세싱 -> page 멀티쓰레딩

# 스크래퍼를 멀티프로세싱 하기 위해 필요한 함수.
# 크롬의 작동방식은 멀티프로세싱 방식이므로,
# CPU scraping, Mainborad scraping 두 작업을 수행할 프로세서들을 할당한다.
def make_scraper(components):
    """
    각 프로세서는 페이지 탐색을 위한 자식 쓰레드들을 만들고 멀티쓰레딩 후 결과를 반환한다.
    """
    # driver = Driver("--headless", "--disable-gpu").make_driver()
    json_dir = f"F:/Github/projects/python-scraping/test"
    if not os.path.exists(json_dir):
        os.makedirs(json_dir)
    os.chmod(json_dir, 0o777)

    driver = Driver().make_driver()
    scraper = DanawaScraper(driver, components)
    results = scraper.main()
    scraper.driver.quit()
    with open(f"F:/Github/projects/python-scraping/test/result_{components}.json", 'w', encoding="utf-8") as file:
        json.dump(results, file, ensure_ascii=False, indent="\t")
    return results

# 검색
def run_test():
    # components: list[str] = ["CPU", "MAINBOARD"]
    # components: list[str] = ["MAINBOARD"]
    components: list[str] = ["CPU"]
    time_start = time.time()

    json_dir = f"F:/Github/projects/python-scraping/test"
    if not os.path.exists(json_dir):
        os.makedirs(json_dir)
    os.chmod(json_dir, 0o777)

    with ProcessPoolExecutor(max_workers=2) as excutor:
        result = excutor.map(make_scraper, components)
    time_end = time.time()
    print(f"scraping: 전체 {time_end - time_start}초 소요됨")
    # 만약 아래의 코드 조각을 멀티프로세스 with 문 안으로 넣으면?
    with open("F:/Github/projects/python-scraping/test/result_total.json", 'w', encoding="utf-8") as file:
        json.dump(result, file, ensure_ascii=False, indent="\t")

if __name__ == "__main__":
    run_test()