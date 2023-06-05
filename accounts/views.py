# Create your views here.
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)

# from rest_framework_simplejwt.authentication import JWTAuthentication
from config.token import TokenAuthenticationHandler, TokenNotFoundError
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model, authenticate
from .serializers import RegisterSerializer, AuthSerializer
from django.core.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from dotenv import load_dotenv
import jwt
import os


class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            pw1 = request.data["password"]
            pw2 = request.data["password2"]
            if pw1 == pw2:
                try:
                    user = serializer.create(serializer.validated_data)
                    validate_password(password=request.data["password"], user=user)
                    user.save()
                    token = TokenObtainPairSerializer.get_token(user)
                    refresh = str(token)
                    access = str(token.access_token)
                    # 회원가입 하게되면 토큰을 발급해준다.
                    res = Response(
                        {
                            "user": serializer.data,
                            "message": "회원가입 성공",
                            "token": {
                                "access": access,
                                "refresh": refresh,
                            },
                        },
                        status=status.HTTP_201_CREATED,
                    )
                    # 토큰은 쿠키에 저장해놓고 사용하게 된다.
                    res.set_cookie(
                        "access",
                        access,
                        secure=True,
                        samesite="none",
                    )
                    res.set_cookie(
                        "refresh",
                        refresh,
                        httponly=True,
                        secure=True,
                        samesite="none",
                    )
                    return res
                except ValidationError as error:
                    return Response(error, status=status.HTTP_400_BAD_REQUEST)
                except Exception as error:
                    return Response(error, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response(
                    ["두 비밀번호가 일치하지 않습니다."], status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AuthView(APIView):
    # 클라이언트는 요청 헤더에 bearer 넣어서 보내야 한다.
    # 로그인이 필요한 페이지(권한이 필요한 페이지)에 들어온 유저의 토큰 유무를 확인
    def get(self, request):
        # 디코딩을 위한 시크릿키가 있는 env 활성화
        load_dotenv()
        # 쿠키에 토큰이 있는 경우
        if "access" in request.COOKIES:
            try:
                access = request.COOKIES.get("access")
                # 토큰 디코딩을 해서 유저 정보 추출을 시도한다.
                payload = jwt.decode(
                    access, os.getenv("JWT_SECRET_KEY"), algorithms=["HS256"]
                )
                user_email = payload.get("email")
                user = get_object_or_404(get_user_model(), email=user_email)
                serializer = AuthSerializer(instance=user)
                # 현재 유저 정보를 반환한다.
                return Response(serializer.data, status=status.HTTP_200_OK)
            # 토큰 기한이 만료된 경우
            except jwt.exceptions.ExpiredSignatureError:
                # 재발급을 시도함
                data = {
                    "refresh": request.COOKIES.get("refresh", None),
                }
                serializer = TokenRefreshSerializer(data=data)
                if serializer.is_valid():
                    access = serializer.data.get("access", None)
                    refresh = serializer.data.get("refresh", None)
                    payload = jwt.decode(
                        access, os.getenv("JWT_SECRET_KEY"), algorithms=["HS256"]
                    )
                    user_email = payload.get("email")
                    user = get_object_or_404(get_user_model(), email=user_email)
                    serializer = AuthSerializer(instance=user)
                    res = Response(
                        {
                            "user": serializer.data,
                            "message": "엑세스 토큰이 만료되어 재발급 하였습니다.",
                            "token": {
                                "access": access,
                                "refresh": refresh,
                            },
                        },
                        status=status.HTTP_200_OK,
                    )
                    res.set_cookie(
                        "access",
                        access,
                        secure=True,
                        samesite="none",
                    )
                    res.set_cookie(
                        "refresh",
                        refresh,
                        httponly=True,
                        secure=True,
                        samesite="none",
                    )
                    return res
                # 재발급 실패한 경우
                raise jwt.exceptions.InvalidTokenError
            # 사용할 수 없는 토큰인 경우
            except jwt.exceptions.InvalidTokenError:
                return Response(
                    {
                        "message": "리프레시 토큰을 사용할 수 없습니다.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            # 쿠키에 토큰이 없는 경우
            return Response(
                {
                    "message": "토큰이 존재하지 않습니다.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class LoginView(APIView):
    """
    처음 로그인 여부를 구분하려는 코드는 if str(request.user) != "AnonymousUser": 였다.
    코드를 아래와 같이 바꾼 이유는 새로고침 시에는 위 코드가 의도대로 작동했지만 SPA에서는 새로고침 없이 컴포넌트만 새로 렌더링 되면서
    화면이 바뀌기 때문에 그것을 사용한 의도에 맞는 코드로 일관성있게 해줄 필요가 있었다.
    확인해보니 새로고침이 없으면 로그인을 해도 AnonymousUser가 나왔지만 등록된 쿠키는 정상적으로 가져오고 있었다.
    결론은 http통신은 기본적으로 무상태성 원칙을 고수해야한다고 생각한다.
    그에 따라 서버는 클라이언트의 상태를 보존하지 않고 오직 토큰값만 받아오고 있으므로,
    쿠키의 여부로 회원을 구분하는 것이 맞다고 생각했다.
    """

    permission_classes = [AllowAny]

    # 로그인
    def post(self, request):
        # if str(request.user) != "AnonymousUser":
        try:
            user = TokenAuthenticationHandler.check_user_from_token(request)
        except TokenNotFoundError:
            user = None
        if user is not None:
            serializer = AuthSerializer(instance=user)
            res = Response(
                {
                    "user": serializer.data,
                    "message": "이미 로그인 상태입니다.",
                    "token": {
                        "access": request.COOKIES.get("access"),
                        "refresh": request.COOKIES.get("refresh"),
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
            return res
        else:
            user = authenticate(
                email=request.data.get("email"), password=request.data.get("password")
            )
            if user:
                serializer = AuthSerializer(user)
                token = TokenObtainPairSerializer.get_token(user)
                refresh = str(token)
                access = str(token.access_token)
                res = Response(
                    {
                        "user": serializer.data,
                        "message": "로그인 성공",
                        "token": {
                            "access": access,
                            "refresh": refresh,
                        },
                    },
                    status=status.HTTP_200_OK,
                )
                res.set_cookie(
                    "access",
                    access,
                    secure=True,
                    samesite="none",
                )
                res.set_cookie(
                    "refresh",
                    refresh,
                    httponly=True,
                    secure=True,
                    samesite="none",
                )
            else:
                res = Response(
                    {
                        "message": "올바른 정보를 입력하세요.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return res

    # 로그아웃
    def delete(self, request):
        res = Response(
            {
                "message": "로그아웃 성공",
            },
            status=status.HTTP_202_ACCEPTED,
        )
        res.delete_cookie("access", samesite="none")
        res.delete_cookie("refresh", samesite="none")
        return res
