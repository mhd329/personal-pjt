from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from dotenv import load_dotenv
import jwt
import os


class TokenAuthenticationHandler:
    @staticmethod
    def check_token_expiry_time(request):
        access = request.COOKIES.get("access")
        load_dotenv()
        try:
            payload = jwt.decode(
                access, os.getenv("JWT_SECRET_KEY"), algorithms=["HS256"]
            )
        except jwt.exceptions.ExpiredSignatureError:
            return "token expired"
        return payload["exp"]

    @staticmethod
    def check_user_from_token(request, token=None):
        try:
            if request is not None:
                access = request.COOKIES.get("access")
            if token is not None:
                access = token
            load_dotenv()
            if access is None:  # access token이 없음
                return None
            try:
                payload = jwt.decode(
                    access, os.getenv("JWT_SECRET_KEY"), algorithms=["HS256"]
                )
            except jwt.exceptions.ExpiredSignatureError:
                return "token expired"
            user_email = payload.get("email")
            user = get_object_or_404(get_user_model(), email=user_email)
            return user
        except Exception as error:
            print("(check_user_from_token) error:", error)
            return None
