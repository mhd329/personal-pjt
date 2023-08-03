# 전체 배포 흐름

<br>

1. 각 프로젝트에 해당하는 도커파일을 작성한다.

2. `.travis.yml` 작성

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
     # CI=true >>> CI 환경에서 동작중임을 명시한다.
     # 강제로 테스트를 한 번 실행한 다음 종료한다.
   
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

3. TravisCI의 해당 repo로 가서 settings의 환경변수에 도커 아이디와 패스워드를 입력한다.

4. githib에 푸쉬

   - `.travis.yml` 파일을 작성하고 TravisCI로 관리할 frontend, backend, nginx등을 github에 푸쉬한다.
   - (활성화 되어있지 않은 경우) TravisCI에서 해당 repo를 활성화하여 빌드 준비를 한다.

5. `docker-compose.yml` 파일을 작성

   ```yaml
   version: "3"
   services:
     컨테이너 이름:
       image: 빌드에 사용할 이미지 # 도커 허브에서 가져오거나 한다.
       # container_name: 컨테이너 이름을 재정의 >>> host도 바뀌는 것 같다.
       # volumes:
         # - (로컬에서의 경로는 생략)(`:` 도 생략)가상 경로 # 가상 경로만을 적어주는 이유는 로컬에서의 경로가 존재하지 않기 때문이다.
         # 즉, 로컬에서 참조하지 않고 오직 가상의 경로만을 사용한다는 의미이다.
         # - 로컬에서의 경로:가상 경로
         # 배포시에는 필요 없는 옵션
       environment:
         - 키=값
         # 백엔드 컨테이너의 경우 DB관련 환경변수 설정을 해 두어야 한다.
         # (+@) Django의 경우는 Django SECRET_KEY 등을 추가하던지 해야 한다.
       mem_limit: 메모리 제한 # 128
   
     react의 경우:
       stdin_open: true # 표준 입출력을 활성화 한다. docker run -it 와 같다.
   
     nginx의 경우:
       restart: always # 비정상 종료되는 경우 항상 재시작을 하게 된다.
       ports:
         - "로컬에서의 포트:가상 포트"
         # 보통 "80:80"으로 정의한다.
       links: # 서로 통신할 컨테이너들을 입력한다.
         - 컨테이너 이름 1
         - 컨테이너 이름 2
   ```

6. 새로운 elasticbeanstalk 환경을 만든다.

   1. 샘플 애플리케이션 >>> .travis.yml을 통한 CI/CD 환경을 구축할 것이다.
   2. 규모가 크지 않기 때문에 단일 인스턴스를 선택한다.
   3. 기존 서비스 역할 사용을 선택하고 적절한 키 페어를 선택한다. 키 페어가 없으면 EC2 인스턴스에 접근할 수 없다.
   4. 3단계 "네트워킹, 데이터베이스 및 태그 설정"은 건너뛴다. 나중에 설정할 예정이다.
   5. 오토 스케일링 그룹에서 만약 로드 밸런서를 활용한 https 환경을 구성할 예정이라면 "밸런싱된 로드" 항목을 선택해야 한다.
      1. 유형은 애플리케이션 로드 밸런서이다.
      2. 리스너 추가를 해준다. 포트는 443, 프로토콜은 HTTPS, 인증서는 사전 발급받은 인증서를 등록한다. 인증서 발급 과정은 인터넷에 잘 정리되어 있다.
      3. 정책은 잘 몰라서 연도를 보고 가장 최신 정책을 사용했다.

7. RDS에서 DB를 생성한다.

   1. 표준 생성을 누른 다음 MySQL을 선택한다. 프리티어 템플릿을 선택한다.
   2. 식별자를 쓰고 마스터 사용자 이름을 넣는다. root가 무난하다.
   3. 암호는 EB 환경변수에 똑같이 넣어줘야 한다.
   4. VPC 보안그룹은 생략한다. 나중에 편집할 예정이다.
   5. 추가 구성을 눌러서 DB의 이름을 정한다. 환경변수에 들어가는 항목이다.
   6. 생성 후 나오는 호스트는 나중에 EB 환경변수에 DB에 대한 호스트로 작성한다.

8. 보안그룹을 설정한다.

   1. AWS VPC에 접속한다.
   2. 왼쪽 탭에 보안 - 보안그룹을 클릭한다.
   3. 보안 그룹 생성을 누르고 새로 생성한다.
   4. 인바운드 규칙을 편집한다. 이름을 짓고 포트는 3306으로 설정한다.

9. RDS에서 만들어둔 DB를 편집한다. 방금 만든 보안그룹을 추가한다.

10. EB의 구성에서 인스턴스 설정을 들어간 다음 방금 만든 보안그룹을 추가한다.

11. EB에 각종 환경변수들을 추가한다.

12. AWS IAM을 추가한다.

    1. TravisCI에서 AWS에 접근하기 위한 사용자이다.
    2. 사용자 생성을 누르고 적절한 이름을 쓴다.
    3. 직접 정책 연결 후 "AdministratorAccess-AWSElasticBeanstalk"에 체크한다.
    4. 만든 다음 아래 탭에서 보안자격증명으로 이동한다.
    5. 액세스키를 발급받는다.
    6. TravisCI의 해당 repo의 settings로 가서 환경변수에 액세스키와 시크릿 액세스키를 입력한다.
    7. AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY

13. .travis.yml을 추가 설정한다.

    ```yml
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
      # CI=true >>> CI 환경에서 동작중임을 명시한다.
      # 강제로 테스트를 한 번 실행한 다음 종료한다.
    
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
    
    deploy: # 배포 단계
      provider: elasticbeanstalk # 외부 서비스 표시(S3, EB, firebase 등)
      region: "ap-northeast-2" # 서비스의 물리적 장소
      app: "docker-fullstack-app" # 어플리케이션 이름
      env: "Docker-fullstack-app-env" # 환경의 이름
      bucket_name: elasticbeanstalk-ap-northeast-2-544545176142 # 해당 eb를 위한 s3 버킷 이름
      bucket_path: "docker-fullstack-app" # 버킷 경로 (앱 이름과 동일)
      on:
        branch: master # 어떤 branch에 push할 때 AWS 배포를 할 것인지 설정
    
      access_key_id: $AWS_ACCESS_KEY # aws iam의 access key
      secret_access_key: $AWS_SECRET_ACCESS_KEY # aws iam의 secret access key
    ```

14. git 푸쉬를 한다.