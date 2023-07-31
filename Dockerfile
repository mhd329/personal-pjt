FROM python:alpine

WORKDIR /app

COPY ./requirements.txt ./

RUN apt-get update && apt-get install -y libmysqlclient-dev
RUN pip install -r ./requirements.txt

COPY . .

EXPOSE 8000