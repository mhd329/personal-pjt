from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from dotenv import load_dotenv
import jwt
import os


class TokenAuthenticationHandler:
    """
    request에 email과 password가 포함되어 있으면 생성자의 authenticate에 의해 self.user에는 어떤 유저 객체가 할당된다.\n
    그 외의 경우 self.user는 None이다.\n
    단순히 토큰으로 유저를 찾는 경우는 find_user_from_token 메서드만 사용해 찾을 수 있다.\n
    이 경우(일반 request)는 request에 email, password가 없어 authenticate으로 유저를 찾을 수 없기 때문에 사용한다.
    """

    def __init__(self, request):
        self.request = request
        try:
            self.user = authenticate(
                email=self.request.data["email"],
                password=self.request.data["password"],
            )
        except:
            # get 요청시 빈 칸에 대한 예외
            # >>> 페이지 처음 접속시 이미 로그인 했는지 여부를 get요청으로 검사할 때,
            # 어떠한 data도 보내지 않기 때문에 None type 인자를 받았다는 에러가 발생한다.
            self.user = None

    @staticmethod
    def check_token_expiry_time(request):
        access = request.COOKIES.get("access", None)
        if access is None:
            return "token is None"
        load_dotenv()
        try:
            payload = jwt.decode(
                access, os.getenv("JWT_SECRET_KEY"), algorithms=["HS256"]
            )
        except jwt.exceptions.ExpiredSignatureError:
            return "token expired"
        except Exception as unexpected_exception:
            print(
                "(check_token_expiry_time) Unexpected exception:", unexpected_exception
            )
            raise unexpected_exception
        return payload["exp"]

    def find_user_from_request(self):
        try:
            if self.user is None:
                return None
            # 일치하는 유저 객체가 있음
            return self.find_user_from_token(token=None)
        except Exception as unexpected_exception:
            # 유저 객체를 찾던 도중 예외 발생
            print(
                "(check_user_from_token) Unexpected exception:",
                unexpected_exception,
            )
            raise unexpected_exception

    def find_user_from_token(self, token=None):
        if self.request is not None:
            access = self.request.COOKIES.get("access", None)
        if token is not None:
            access = token
        load_dotenv()
        if access is None:
            # 유저 객체는 있지만, 토큰이 없는 상태
            # >>> 신규 로그인 절차
            return "token is None"
        try:
            payload = jwt.decode(
                access, os.getenv("JWT_SECRET_KEY"), algorithms=["HS256"]
            )
        except jwt.exceptions.ExpiredSignatureError:
            # 유저 객체는 있지만, 토큰은 만료된 상태
            # >>> 재발급 절차
            return "token expired"
        # 유저 객체가 있고, 토큰도 만료되지 않은 상태
        user_email = payload.get("email")
        user = get_object_or_404(get_user_model(), email=user_email)
        return user
