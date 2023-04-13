# from django.shortcuts import render
from .serializers import TodoSerializer, TodoCreateSerializer, TodoDetailSerializer
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import Todo


# Create your views here.
class TodosAPIView(APIView):
    def get(self, request, user_pk):
        todos = Todo.objects.filter(user_id=user_pk, complete=False)
        serializer = TodoSerializer(todos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def post(self, request, user_pk):
        serializer = TodoCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
    def get(self, request, user_pk):
        todos = get_object_or_404(Todo, user_id=user_pk)
        serializer = TodoSerializer(todos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

    def delete(self, request, user_pk):
        todos = get_object_or_404(Todo, user_id=user_pk)
        todos.delete()
        return Response(status=status.HTTP_200_OK)