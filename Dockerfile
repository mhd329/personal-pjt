FROM python:alpine

WORKDIR /app

COPY ./requirements.txt ./

RUN apk update && apk add mysql-client mariadb-connector-c-dev
RUN pip install -r ./requirements.txt

COPY . .

EXPOSE 8000