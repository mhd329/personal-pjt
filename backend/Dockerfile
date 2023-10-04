FROM python:3.10-alpine3.18
WORKDIR /app
COPY ./requirements.txt ./
RUN apk update && apk add mariadb-connector-c-dev build-base
RUN pip install -r ./requirements.txt
COPY . .
CMD gunicorn --bind 0.0.0.0:5000 app:server