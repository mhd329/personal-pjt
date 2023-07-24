# Dockerfile과 Dockerfile.dev를 나누는 이유는 개발 환경과 배포 환경에서 다른 도커 스크립트를 사용하기 때문인데,
# 개발 환경에서만 mysql을 사용할 것이기 때문에 Dockerfile과 Dockerfile.dev 같은 스크립트가 사용되므로 굳이 둘 다 만들 필요는 없다.
# 배포 환경에서는 AWS RDS를 사용할 예정이다.

FROM mysql:5.7

ADD ./my.cnf /etc/mysql/conf.d/my.cnf

