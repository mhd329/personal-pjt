# from django.shortcuts import render
from .serializers import (
    TodoSerializer,
    TodoCreateSerializer,
    TodoDetailSerializer,
    TodoChangeSerializer,
)
from config.cookie import TokenAuthenticationHandler
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import Todo


# Create your views here.
class TodoListAPIView(APIView):  # 로그인 후 처음 나오는 메인 페이지에 담을 내용들
    def get(self, request):
        try:
            token_handler = TokenAuthenticationHandler(request)
            user = token_handler.find_user_from_token()
            if user == "token is None":
                return Response(
                    {
                        "message": "토큰이 존재하지 않습니다.",
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            elif user == "token expired":
                return Response(
                    {
                        "message": "만료된 토큰입니다.\n다시 로그인 해 주세요.",
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            else:
                todos = Todo.objects.filter(user_id=user.pk, complete=False)
                serializer = TodoSerializer(todos, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as error:
            return Response(
                {
                    "message": str(error),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request):  # 새로운 todo 항목 만들기
        try:
            token_handler = TokenAuthenticationHandler(request)
            user = token_handler.find_user_from_token()
            serializer = TodoCreateSerializer(data=request.data)
            if user == "token is None":
                return Response(
                    {
                        "message": "토큰이 존재하지 않습니다.",
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            elif user == "token expired":
                return Response(
                    {
                        "message": "만료된 토큰입니다.\n다시 로그인 해 주세요.",
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            else:
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                else:
                    for key, value in serializer.errors.items():
                        error_message = f"{key}: {value[0]}"
                    return Response(
                        {
                            "message": error_message,
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


class TodoAPIView(APIView):
    def get(self, request, todo_pk):
        try:
            token_handler = TokenAuthenticationHandler(request)
            user = token_handler.find_user_from_token()
            if user == "token is None":
                return Response(
                    {
                        "message": "토큰이 존재하지 않습니다.",
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            elif user == "token expired":
                return Response(
                    {
                        "message": "만료된 토큰입니다.\n다시 로그인 해 주세요.",
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            else:
                try:
                    todo = get_object_or_404(Todo, user_id=user.id, pk=todo_pk)
                except:  # Todo가 없음, 에러 메세지를 출력하는 대신 콘텐츠를 제공하지 않고 빈 화면을 보여준다.
                    return Response(
                        {
                            "message": "잘못된 접근입니다.",
                        },
                        status=status.HTTP_404_NOT_FOUND,
                    )
                serializer = TodoDetailSerializer(todo)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as error:
            return Response(
                {
                    "message": str(error),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def patch(self, request, todo_pk):
        try:
            token_handler = TokenAuthenticationHandler(request)
            user = token_handler.find_user_from_token()
            if user == "token is None":
                return Response(
                    {
                        "message": "토큰이 존재하지 않습니다.",
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            elif user == "token expired":
                return Response(
                    {
                        "message": "만료된 토큰입니다.\n다시 로그인 해 주세요.",
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            else:
                try:
                    todo = get_object_or_404(Todo, user_id=user.id, pk=todo_pk)
                except:  # Todo가 없음, 에러 메세지를 출력하는 대신 콘텐츠를 제공하지 않고 빈 화면을 보여준다.
                    return Response(
                        {
                            "message": "잘못된 접근입니다.",
                        },
                        status=status.HTTP_404_NOT_FOUND,
                    )
                serializer = TodoChangeSerializer(todo, data=request.data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as error:
            return Response(
                {
                    "message": str(error),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def delete(self, request, todo_pk):
        try:
            token_handler = TokenAuthenticationHandler(request)
            user = token_handler.find_user_from_token()
            if user == "token is None":
                return Response(
                    {
                        "message": "토큰이 존재하지 않습니다.",
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            elif user == "token expired":
                return Response(
                    {
                        "message": "만료된 토큰입니다.\n다시 로그인 해 주세요.",
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            else:
                try:
                    todo = get_object_or_404(Todo, user_id=user.id, pk=todo_pk)
                except:  # Todo가 없음, 에러 메세지를 출력하는 대신 콘텐츠를 제공하지 않고 빈 화면을 보여준다.
                    return Response(
                        {
                            "message": "잘못된 접근입니다.",
                        },
                        status=status.HTTP_404_NOT_FOUND,
                    )
                try:
                    todo.delete()
                    return Response(
                        status=status.HTTP_200_OK,
                    )
                except Exception as error:
                    return Response(
                        {
                            "message": str(error),
                        },
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
        except Exception as error:
            return Response(
                {
                    "message": str(error),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class AllTodosAPIView(APIView):
    def get(self, request):
        try:
            token_handler = TokenAuthenticationHandler(request)
            user = token_handler.find_user_from_token()
            if user == "token is None":
                return Response(
                    {
                        "message": "토큰이 존재하지 않습니다.",
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            elif user == "token expired":
                return Response(
                    {
                        "message": "만료된 토큰입니다.\n다시 로그인 해 주세요.",
                    },
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            else:
                try:
                    todos = Todo.objects.filter(user_id=user.pk)
                except:  # Todo가 없음, 에러 메세지를 출력하는 대신 콘텐츠를 제공하지 않고 빈 화면을 보여준다.
                    return Response(
                        status=status.HTTP_204_NO_CONTENT,
                    )
                serializer = TodoSerializer(todos, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as error:
            return Response(
                {
                    "message": str(error),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
