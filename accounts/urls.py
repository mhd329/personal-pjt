from django.urls import path
from .views import *


urlpatterns = [
    path("register/", RegisterAPIView.as_view()),  # post 요청만 처리함
]
