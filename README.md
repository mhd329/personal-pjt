# 개요

<br>

- 기능
  - 완제품 컴퓨터 가격 분석 서비스
- 목적
  - 완제품 컴퓨터를 좀 더 저렴하게 구매할 수 있게 정보를 제공함
- 방법
  - 컴퓨존 기준
    - 처음에는 이미지 형태의 컴퓨터 스펙 정보를 처리하려고 하니 기획했던 크롤링 프로젝트가 갑자기 딥러닝 프로젝트가 되버림
      => 텍스트로 된 컴퓨터 부품 정보가 나오는 사이트를 찾음
      => 컴퓨존이 가장 정보가 풍부하면서 텍스트로 된 부품 정보까지 상세하게 제공되고 있었다.
  - 데스크탑 메뉴를 클릭하면 나오는 페이지를 페이지 번호별로 파싱
    - requests, BS4 사용
    - MySQL에 저장
      - field로 Mainboard, CPU, VGA, RAM, SSD(HDD), power, case 등을 구분
- 향후 개선 방향
  - 완제품 판매가와 실제 조립 비용으로부터 마진율을 계산해서 알려주는 기능을 추가할 예정
  - 많은 회사에서 flask를 사용하던 프로젝트에서 fastapi로 옮겨가는 추세이다. 그에 따라 fastapi로 전환
- 개발 환경 구성
  - 운영 체제: Windows 10
  - 주 개발 언어: Python
  - 개발 도구: PyCharm
  - Frontend: HTML, CSS, Javascript
  - Backend: Flask
  - Web Server: Nginx
  - CI/CD: Github Actions, Docker, Azure

<br>

- 기술 선정 이유
  - 주 개발 언어
    - NodeJS vs Python: 여러 강력한 crawling library들이 python에 많이 있었다. node에서 비슷한 기능들을 구현하려면 직접 해야 하는 부분들이 있었는데, node숙련도가 python에 비해 떨어지기도 하고 시간도 없어서 python으로 빠르게 개발하기로 하였다.
    - VSCode vs PyCharm: 이번에 PyCharm 리딤코드를 받았는데 사용도 해볼 겸 PyCharm을 선택함. 가장 중요한 점은, 코드 몇 줄 작성하자마자 PEP8 컨벤션을 준수하지 않은 코드를 찾아주던데 이것은 컨벤션을 지키려는 나에게 있어서 상당히 좋은 기능이었다. 나머지 확장 기능은 vscode와 전체적으로 비슷해서 PyCharm을 선택했다.
    - React vs 기본 3종 세트: 기본적으로 정적 페이지를 제공하다가 찾기 요청이 왔을때만 크롤링을 해서 갱신해주면 된다. 그 과정에서 굳이 React의 필요를 못 느꼈다.
    - Django vs Flask: 프로젝트의 구성이 단순했다. 회원 관리 기능이나 별도로 보안에 신경쓸 기능들이 많지 않았음. 따라서 기본적으로 많은 편의를 제공해주는 대신 무거운 Django를 굳이 쓸 이유가 없었다. flask 개발 초기에 설정할 것은 많았지만 낭비되는 기능 없이 필요한 것만 가져가는 가벼운 구성을 하고 싶었다.
    - Nginx vs Apache: nginx와 apache 모두 멀티프로세싱에 단일 쓰레딩 방식으로 gil을 우회할 수 있기 때문에 둘 중 더 가벼운 구성을 가진 nginx를 선택했다.
    - TravisCI vs Jenkins vs Github Actions: 셋 다 무료인데, 젠킨스의 경우 서버를 별도로 준비하고 거기서 운영해야 하는데 소규모의 프로젝트에서는 적절한 운영 방식이 아닌것 같았다. 그래서 TravisCI를 사용하려고 했는데, Github Actions이 travis와 별로 기능적인 차이도 없으면서 github에서 기본적으로 제공해주기 때문에 절차적으로 더 단순한 Github Actions을 선택했다.
- 고민 사항
  - DB
    1. 컴퓨터 가격 정보는 계속 갱신되어야 할까? 아니면 유저가 요청했을 때만 탐색을 할까?
       - 만약 계속 갱신된다면 전체적으로 바뀌는 DB를 어떻게 최적화 할까?
         - DB Replication 도입
    2. 대용량 데이터 처리에 속도가 빠른 MongoDB나 Redis를 사용할지 아니면 무결성 유지와 쿼리 조작에 좋은 RDBMS를 쓸지 고민
