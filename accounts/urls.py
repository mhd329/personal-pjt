from django.urls import path
from .views import *

app_name = "accounts"

urlpatterns = [
    path("register", RegisterAPIView.as_view(), name="register"),  # post 요청만 처리함
    path("auth", AuthView.as_view()),
]
