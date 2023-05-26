# Create your views here.
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model, authenticate
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .serializers import RegisterSerializer
from rest_framework.views import APIView
from rest_framework import status
from dotenv import load_dotenv
import jwt
import os


class RegisterAPIView(APIView):
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
                    res.set_cookie("access", access, httponly=True)
                    res.set_cookie("refresh", refresh, httponly=True)
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
    # 헤더에 bearer 넣어서 보내기
    authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated] => 로그인 된 사람만 호출 허용하는 권한 설정

    # 로그인 페이지에 들어온 유저의 정보를 확인
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
                serializer = RegisterSerializer(instance=user)
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
                    serializer = RegisterSerializer(instance=user)
                    res = Response(
                        {
                            "user": serializer.data,
                            "message": "토큰을 재발급 하였습니다.",
                            "token": {
                                "access": access,
                                "refresh": refresh,
                            },
                        },
                        status=status.HTTP_200_OK,
                    )
                    res.set_cookie("access", access)
                    res.set_cookie("refresh", refresh)
                    return res
                # 재발급 실패한 경우
                raise jwt.exceptions.InvalidTokenError
            # 사용할 수 없는 토큰인 경우
            except jwt.exceptions.InvalidTokenError:
                return Response(
                    {
                        "message": "사용할 수 없는 토큰입니다.",
                        "token": {
                            "access": request.COOKIES.get("access"),
                            "refresh": request.COOKIES.get("refresh"),
                        },
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            # 쿠키에 토큰이 없는 경우
            return Response(
                {
                    "message": "토큰이 존재하지 않습니다.",
                    "token": {
                        "access": None,
                        "refresh": None,
                    },
                },
                status=status.HTTP_200_OK,
            )

    # 로그인
    def post(self, request):
        if str(request.user) != "AnonymousUser":
            user_email = request.user.email
            user = get_object_or_404(get_user_model(), email=user_email)
            serializer = RegisterSerializer(instance=user)
            res = Response(
                {
                    "user": serializer.data,
                    "message": "이미 로그인 하였습니다.",
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
                serializer = RegisterSerializer(user)
                token = TokenObtainPairSerializer.get_token(user)
                refresh = str(token)
                access = str(token.access)
                res = Response(
                    {
                        "user": serializer.data,
                        "message": "토큰 응답",
                        "token": {
                            "access": access,
                            "refresh": refresh,
                        },
                    },
                    status=status.HTTP_200_OK,
                )
                res.set_cookie("access", access, httponly=True)
                res.set_cookie("refresh", refresh, httponly=True)
                return res
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
        print("로그아웃 전 쿠키 :", request.COOKIES)
        res = Response(
            {
                "message": "로그아웃 성공",
            },
            status=status.HTTP_202_ACCEPTED,
        )
        res.set_cookie("access", "")
        res.set_cookie("refresh", "")
        return res
