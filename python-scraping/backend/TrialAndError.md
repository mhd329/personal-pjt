# Trial & Error

<br>

- 크롬 드라이버를 만드는 과정에서 경로 설정을 하지 않게 되기까지의 해결 과정

  - modules/crawler.py 하위의 make_driver 함수에 대해, 처음에는 아래와 같이 설정했었다.

  - ```python
    def make_driver():
        options = Options()
        options.add_argument("--headless")
        options.add_argument("--disable-gpu")
        options.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
        )
        driver = webdriver.Chrome(
            service=Service(executable_path=ChromeDriverManager().install()),
            options=options,
        )
        return driver
    ```

  - 위와 같이 하면 단일 검색에서는 문제가 없었는데 멀티 프로세싱을 적용하니 권한이 없다는 문제가 나왔음

  - 권한 문제인가 싶어서 원본 패키지의 `os.chmod(driver_path, 0o755)`를 `os.chmod(driver_path, 0o777)`로 바꿔주었지만 소득이 없었다.

  - 아래의 경로가 번갈아가며 나오는 것을 확인했다(경로에 일관성이 없었다.)

  - ```
    "C:/Users/mhd32/.wdm/drivers/chromedriver/win64/117.0.5938.89/chromedriver-win32/chromedriver.exe"
    "C:/Users/mhd32/.wdm/drivers/chromedriver/win64/117.0.5938.89/chromedriver.exe"
    ```

  - `service=Service(executable_path="C:/Users/mhd32/.wdm/drivers/chromedriver/win64/117.0.5938.89/chromedriver-win32/chromedriver.exe"),`

  - 경로와 관련된 문제인가 싶어서 위와 같이 명시적으로 경로를 지정해주니 에러가 발생하지 않았다.

  - 환경이 바뀔 때 마다 매번 경로를 직접 지정해주기는 번거로우니, 드라이버가 설치될 경로를 직접 지정해놓고 거기서 관리해주고 싶었다.

  - 테스트를 위해서 `DRIVER_PATH="C:/drivers/chromedriver/"` 라는 환경 변수를 설정하고, 기존의 ChromeDriverManager 클래스를 상속받는 클래스를 새로 만들고 install 메서드를 재정의 하였다.

  - ```python
    class CustomChromeDriverManager(ChromeDriverManager):
        def install(self):
            # 원하는 ChromeDriver 버전 및 경로 지정
            driver_path = os.getenv("DRIVER_PATH")
            self.driver = driver_path
    ```

  - 결론적으로는 잘못된 코드이긴 한데(설치하는 코드가 빠졌고, 결과로 driver_path를 반환해야 하는데 현재 설치도 하지 않고 반환값도 없음), 어쨌든 `executable_path=None` 인 상황에서 오히려 잘 작동하고 있었다.

  - 검색을 해보니 Selenium이 업데이트 되었고, 기존에 ChromeDriverManager를 통해 드라이버를 다운로드하거나 핸들링 하던 작업이 이제는 SeleniumManager라는 것 때문에 필요가 없게 되었다고 한다.

    - ```
      https://stackoverflow.com/questions/76749878/i-cant-install-chromedrivermanager-with-chromedrivermanager-install
      
      Above should solve your issue. Having said that, with latest selenium(v4.6.0 or above), you don't really need ChromeDriverManager to download/handle browser drivers. Selenium's new tool known as SeleniumManager will do what ChromeDriverManager used to do. So the code now can be simplified as below:
      
      options = Options()
      options.add_experimental_option("detach", True)
      driver = webdriver.Chrome(options=options)
      driver.get("https://www.pinterest.com/ideas/")
      ```

    - ```
      https://www.selenium.dev/blog/2022/introducing-selenium-manager/
      
      Selenium: now with batteries included!
      The Selenium project wants to improve the user experience, and one of the first steps is to help all users to simplify how they set up their environment. Configuring browser drivers has been for many years a task which users need to perform in order to have a working environment to run Selenium.
      
      Setting up a browser driver once is not that complicated, but as browser release cycles got shorter, and now we have a new Chrome/Firefox/Edge version every 4-6 weeks, the task of keeping the browser driver in sync with the browser version is not that easy anymore.
      
      Selenium Manager is a new tool that helps to get a working environment to run Selenium out of the box. Beta 1 of Selenium Manager will configure the browser drivers for Chrome, Firefox, and Edge if they are not present on the PATH.
      
      To run a Selenium test with Selenium 4.6, you only need to have Chrome, Firefox, or Edge installed. If you already have browser drivers installed, this feature will be ignored. If you’d like to help us test it, though, delete your drivers or remove your third party driver manager and things should still “just work.” If they don’t, please file a bug report.
      
      Future releases of Selenium Manager will eventually even download browsers if necessary.
      ```