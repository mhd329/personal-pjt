# 도커를 통한 배포 흐름

<br>

1. `.travis.yml` 작성

   ```yaml
   # 언어 설정
   language: generic
   
   # 관리자 권한 부여
   sudo: required
   
   # 빌드할 서비스 이름
   services:
     - docker
   
   # 사전 작업으로 도커 이미지를 빌드함
   before_install:
   # - docker build -t {빌드할 이미지 이름} -f {빌드에 쓸 도커파일} {도커파일 위치}
     - docker build -t mhd329/react-test-app -f ./frontend/Dockerfile.dev ./frontend
   
   # 빌드된 이미지로 테스트
   script:
   # - docker run -e {설정할 컨테이너 환경변수} {기반 이미지} {컨테이너 내부에서 실행될 명령어}
     - docker run -e CI=true mhd329/react-test-app npm run test
   
   # 테스트 성공 후 실제 배포를 위한 이미지들을 빌드
   after_success:
   # - docker build -t {이미지 이름} {도커 파일의 위치}
     - docker build -t mhd329/docker-frontend ./frontend
   
     # 도커 로그인
     # '|' 는 파이프 문자이며, 어떤 출력을 다른 명령어의 입력으로 연결해준다.
     # 환경 변수는 TravisCI의 해당 프로젝트 settings에서 설정할 수 있다.
     - echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_HUB_ID" --password-stdin
   
     # 빌드된 이미지를 도커 허브에 푸쉬
     # docker push {이미지 이름}
     - docker push mhd329/docker-frontend
   ```

2. githib에 푸쉬

   - `.travis.yml` 파일을 작성하고 TravisCI로 관리할 frontend, backend, nginx등을 github에 푸쉬한다.

3. TravisCI에서 연동된 해당 repo를 활성화

4. `docker-compose.yml` 파일을 작성

   ```yaml
   version: "3"
   services:
     컨테이너 이름:
       image: 빌드에 사용할 이미지 # 도커 허브에서 가져오거나 한다.
       container_name: 컨테이너 이름을 재정의 # host도 바뀐다.
       volumes:
         - (로컬에서의 경로는 생략)(`:` 도 생략)가상 경로 # 가상 경로만을 적어주는 이유는 로컬에서의 경로가 존재하지 않기 때문이다.
         # 즉, 로컬에서 참조하지 않고 오직 가상의 경로만을 사용한다는 의미이다.
         - 로컬에서의 경로:가상 경로
       environment:
         - 키=값
       mem_limit: 메모리 제한
   
     react의 경우:
       stdin_open: true # 표준 입출력을 활성화 한다. docker run -it 와 같다.
   
     nginx의 경우:
       restart: always # 비정상 종료되는 경우 항상 재시작을 하게 된다.
       ports:
         - "로컬에서의 포트:가상 포트"
       links: # 서로 통신할 컨테이너들을 입력한다.
         - 컨테이너 이름 1
         - 컨테이너 이름 2
   ```

   