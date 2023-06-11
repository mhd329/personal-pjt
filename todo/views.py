# from django.shortcuts import render
from .serializers import TodoSerializer, TodoCreateSerializer, TodoDetailSerializer
from config.cookie import TokenAuthenticationHandler
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import Todo


# Create your views here.
class TodoListAPIView(APIView):  # 로그인 후 처음 나오는 메인 페이지에 담을 내용들
    def get(self, request):
        try:
            user = TokenAuthenticationHandler.check_user_from_token(request)
            if user is not None:
                todos = Todo.objects.filter(user_id=user.pk, complete=False)
                serializer = TodoSerializer(todos, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:  # 쿠키에 토큰이 없거나 각종 예외의 경우(user == None)
                return Response(
                    {
                        "message": "토큰이 존재하지 않습니다.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as authorization_error:  # 예외 발생시 사용자와 사용자의 인증 상태를 print
            print(request.user)
            print(request.user.is_authenticated)
            return Response(
                {
                    "message": str(authorization_error),
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

    def post(self, request):  # 새로운 todo 항목 만들기
        try:
            serializer = TodoCreateSerializer(data=request.data)
            user = TokenAuthenticationHandler.check_user_from_token(request)
            if user is not None:
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                else:
                    return Response(
                        {
                            "message": serializer.errors,
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            else:  # 쿠키에 토큰이 없거나 각종 예외의 경우(user == None)
                return Response(
                    {
                        "message": "토큰이 존재하지 않습니다.",
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
    def get(self, request, user_pk, todo_pk):
        todo = get_object_or_404(Todo, user_id=user_pk, pk=todo_pk)
        serializer = TodoDetailSerializer(todo)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, user_pk, todo_pk):
        todo = get_object_or_404(Todo, user_id=user_pk, pk=todo_pk)
        serializer = TodoDetailSerializer(todo, data=request.data)
        print(serializer)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AllTodosAPIView(APIView):
    def get(self, request):
        user = TokenAuthenticationHandler.check_user_from_token(request)
        try:
            if user is not None:
                todos = get_object_or_404(Todo, user_id=user.pk)
                serializer = TodoSerializer(todos, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:  # 쿠키에 토큰이 없거나 각종 예외의 경우(user == None)
                return Response(
                    {
                        "message": "토큰이 존재하지 않습니다.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as authorization_error:
            return Response(
                {
                    "message": str(authorization_error),
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

    def delete(self, request, user_pk):
        todos = get_object_or_404(Todo, user_id=user_pk)
        todos.delete()
        return Response(status=status.HTTP_200_OK)
