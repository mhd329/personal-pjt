FROM python:alpine

WORKDIR /app

COPY ./requirements.txt ./

RUN sudo apt-get update
RUN sudo apt-get install libmysqlclient-dev
RUN pip install -r ./requirements.txt

COPY . .

EXPOSE 8000