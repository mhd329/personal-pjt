from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from dotenv import load_dotenv
import jwt
import os


class TokenNotFoundError(Exception):
    def __init__(self, request):
        self.request = request

    def __str__(self):
        if "access" not in self.request.COOKIES:
            # 쿠키에 access항목이 없는 경우
            return "로그인 후 이용해주세요."
        else:
            # 쿠키에 access항목은 있으나 빈 문자열인 경우
            return "토큰이 존재하지 않습니다."


class TokenAuthenticationHandler:
    load_dotenv()

    @staticmethod
    def check_user_from_token(request):
        try:
            access_token = request.COOKIES["access"]
            payload = jwt.decode(
                access_token, os.getenv("JWT_SECRET_KEY"), algorithms=["HS256"]
            )
            user_email = payload.get("email")
            user = get_object_or_404(get_user_model(), email=user_email)
            return user
        except KeyError:
            raise TokenNotFoundError(request)
        except Exception as error:
            raise error
