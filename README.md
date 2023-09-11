# 개요

<br>

- 기능
  - 완제품 컴퓨터 가격 비교분석 사이트
- 목적
  - 완제품 컴퓨터를 좀 더 저렴하게 구매할 수 있게 정보를 제공함
- 방법
  - 다나와, 컴퓨존을 기준으로 해당 사이트의 컴퓨터 가격 data mining
    1. crawling으로 가격과 제품에 대한 data가 포함되어 있는 페이지를 선별
       - dfs 알고리즘을 적용하여 탐색
         1. DOM트리의 최상단으로부터 깊이 우선 탐색을 진행
         2. target으로 하는 키워드가 나오면 해당 위치서부터 
    2. 선별된 페이지들을 parsing
       - BS4 사용
       - MySQL에 저장
         - field로 Mainboard, CPU, VGA, RAM, SSD(HDD), power, case 등을 추가
- 향후 개선 방향
  - 완제품 판매가와 실제 조립 비용으로부터 마진율을 계산해서 알려주는 기능을 추가할 예정
- 개발 환경 구성
  - 운영 체제: Windows 10
  - 주 개발 언어: Python
  - 개발 도구: PyCharm
  - Frontend 개발 언어: HTML, CSS, Javascript
  - Backend framework: Django REST
  - Web Server: Nginx
  - 형상 관리: Git, Github
  - CI/CD
    - CI: Github Actions
    - CD: Docker, Azure

<br>

- 사용 후보에서 탈락된 기술, 도구들
  - 주 개발 언어
    - NodeJS: