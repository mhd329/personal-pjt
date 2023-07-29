FROM python:alpine

WORKDIR /app

COPY ./requirements.txt ./

RUN pip install -r requirements.txt

COPY ./ ./

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8443", "config.wsgi:application", "--certfile", "./TodoApp.crt", "--keyfile", "./TodoApp.key"]