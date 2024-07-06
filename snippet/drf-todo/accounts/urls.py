from django.urls import path
from .views import *

app_name = "accounts"

urlpatterns = [
    path("register", RegisterAPIView.as_view()),  # 회원 가입, post 요청만 처리함
    path("refresh", TokenRefreshView.as_view()),  # 액세스토큰 재발급, 회원 권한 검증
    path("login", LoginView.as_view()),  # 로그인
    path("logout", LogoutView.as_view()),  # 로그아웃
]
