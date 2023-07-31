FROM python:3.10-alpine3.18

WORKDIR /app

COPY ./requirements.txt ./

RUN apk update && apk add mariadb-connector-c-dev build-base
RUN pip install -r ./requirements.txt

COPY . .

CMD python manage.py collectstatic --no-input && \
    python manage.py makemigrations && \
    python manage.py migrate && \
    gunicorn -b 0:8000 config.wsgi:application

EXPOSE 8000