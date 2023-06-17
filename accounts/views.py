# Create your views here.
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)

# from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.password_validation import validate_password
import rest_framework_simplejwt.exceptions as BlacklistExceptions
from django.contrib.auth import get_user_model, authenticate
from .serializers import RegisterSerializer, AuthSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from config.cookie import TokenAuthenticationHandler
from django.core.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
import jwt
import os


class RegisterAPIView(APIView):
    permission_classes = [
        AllowAny,
    ]

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
                            "uid": user.id,
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
                    return Response(
                        {
                            "message": str(error),
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                except Exception as error:
                    return Response(
                        {
                            "message": str(error),
                        },
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
            else:
                return Response(
                    {
                        "message": "동일한 비밀번호를 입력해주세요.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        for key, value in serializer.errors.items():
            error_message = f"{key}: {value[0]}"
        return Response(
            {
                "message": error_message,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class AuthView(APIView):
    # 클라이언트는 요청 헤더에 bearer 넣어서 보내야 한다.
    def get(self, request):
        try:  # 로그인이 필요한 페이지(권한이 필요한 페이지)에 들어온 유저의 토큰 유무를 확인하는 로직
            user = TokenAuthenticationHandler.check_user_from_token(request)
            if user is not None:
                serializer = AuthSerializer(instance=user)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:  # 쿠키에 토큰이 없는 경우(user == None)
                return Response(
                    {
                        "message": "토큰이 존재하지 않습니다.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except jwt.exceptions.ExpiredSignatureError:  # 액세스 토큰 기한 만료로 인한 재발급 시도
            try:
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
            except jwt.exceptions.InvalidTokenError:  # 액세스 토큰 재발급 실패
                return Response(
                    {
                        "message": "액세스 토큰을 재발급 할 수 없습니다(유효하지 않은 리프레시 토큰입니다).",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except jwt.exceptions.InvalidTokenError:  # 사용할 수 없는 토큰
            return Response(
                {
                    "message": "유효하지 않은 액세스 토큰입니다.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class LoginView(APIView):  # 로그인
    permission_classes = [
        AllowAny,
    ]

    def post(self, request):
        # if str(request.user) != "AnonymousUser":
        try:
            user = TokenAuthenticationHandler.check_user_from_token(request)
            if user is not None:  # user!=None, 유저가 이미 있음을 의미함
                serializer = AuthSerializer(instance=user)
                res = Response(
                    {
                        "user": serializer.data,
                        "message": "이미 로그인 상태입니다.",
                        "token": {
                            "access": request.COOKIES["access"],
                            "refresh": request.COOKIES["refresh"],
                        },
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
                return res
            else:
                print(user)
                # 유저 정보 추출이 되지 않았다면(== 유저가 로그인 하지 않은 상태라면) 실행
                user = authenticate(
                    email=request.data["email"],
                    password=request.data["password"],
                )
                if user:
                    # 일치하는 유저가 있다면 실행
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
                    # 일치하는 유저가 없으면 실행
                    res = Response(
                        {
                            "message": "올바른 정보를 입력하세요.",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                return res
        except Exception as error:
            return Response(
                {
                    "message": str(error),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LogoutView(APIView):  # 로그아웃
    def delete(self, request):
        try:
            if request.COOKIES["access"] and request.COOKIES["refresh"]:
                refresh = RefreshToken(token=request.COOKIES["refresh"])
                refresh.blacklist()
                res = Response(
                    {
                        "message": "로그아웃 성공",
                    },
                    status=status.HTTP_202_ACCEPTED,
                )
                res.delete_cookie("access", samesite="none")
                res.delete_cookie("refresh", samesite="none")
                return res
            else:
                return Response(
                    {
                        "message": "토큰 검증 실패",
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
        except BlacklistExceptions.TokenError as blacklist_error:
            return Response(
                {
                    "message": str(blacklist_error),
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except Exception as error:
            return Response(
                {
                    "message": str(error),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
