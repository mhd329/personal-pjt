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
  - 많은 회사에서 flask를 사용하던 프로젝트에서 fastapi로 옮겨가는 추세이다. 그에 따라 fastapi로 전환
- 개발 환경 구성
  - 운영 체제: Windows 10
  - 주 개발 언어: Python
  - 개발 도구: PyCharm
  - Frontend 개발 언어: HTML, CSS, Javascript
  - Backend framework: Flask
  - Web Server: Nginx
  - 형상 관리: Git, Github
  - CI/CD
    - CI: Github Actions
    - CD: Docker, Azure

<br>

- 기술, 도구들의 선정 이유
  - 주 개발 언어
    - NodeJS vs Python: 여러 강력한 crawling library들이 python에 많이 있었다. node에서 비슷한 기능들을 구현하려면 직접 해야 하는 부분들이 있었는데, node숙련도가 python에 비해 떨어지기도 하고 시간도 없어서 python으로 빠르게 개발하기로 하였다.
    - VSCode vs PyCharm: 이번에 PyCharm 리딤코드를 받았는데 사용도 해볼 겸 PyCharm을 선택함. 가장 중요한 점은, 코드 몇 줄 작성하자마자 PEP8 컨벤션을 준수하지 않은 코드를 찾아주던데 이것은 컨벤션을 지키려는 나에게 있어서 상당히 좋은 기능이었다. 나머지 확장 기능은 vscode와 전체적으로 비슷해서 PyCharm을 선택했다.
    - React VS 기본 3종 세트: Crawling을 하고 가공된 데이터로 SSR 해주면 된다. 클라이언트 사이드에서 동적으로 DOM을 조작하는 경우는 데이터를 받고 그것을 조회할 수 있게 갱신해주는 것 뿐이기 때문에 굳이 React의 필요를 못 느꼈다.
    - Django VS Flask: 프로젝트의 구성이 단순했다. 회원 관리 기능이나 별도로 보안에 신경쓸 기능들이 많지 않았음. 따라서 기본적으로 많은 편의를 제공해주는 대신 무거운 Django를 굳이 쓸 이유가 없었다. flask로 개발이나 실 사용에 있어서 빠른 속도감을 가지게 하고 싶었다.
    - Nginx VS Apache: 

