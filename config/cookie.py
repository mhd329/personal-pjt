from rest_framework_simplejwt.authentication import JWTAuthentication


from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from dotenv import load_dotenv
import jwt
import os


# class TokenAuthenticationHandler:
#     @staticmethod
#     def check_user_from_token(request):
#         try:
#             print("시작")
#             access = request.COOKIES["access"]
#             load_dotenv()
#             payload = jwt.decode(
#                 access, os.getenv("JWT_SECRET_KEY"), algorithms=["HS256"]
#             )
#             user_email = payload.get("email")
#             user = get_object_or_404(get_user_model(), email=user_email)
#             return user
#         except KeyError:
#             print(111111)
#             # 쿠키에 액세스 토큰이 존재하지 않음
#             return None
#         except jwt.exceptions.ExpiredSignatureError:
#             print(222222)
#             # 액세스 토큰 기한 만료
#             print("이것은 토큰 기한 만료에 대한 예외입니다.")
#             ...
#         except jwt.exceptions.InvalidTokenError:
#             print(333333)
#             print("이것은 사용할 수 없는 토큰에 대한 예외입니다.")
#             # 사용할 수 없는 토큰
#             ...
#         except Exception as error:
#             print(444444)
#             # 기타 서버 에러
#             raise error


class TokenAuthenticationHandler:
    def check_user_from_token(request):
        simpleJWT_authenticator = JWTAuthentication()
        try:
            response = simpleJWT_authenticator.authenticate(request)
            user, token = response
            return user
        except:
            ...
