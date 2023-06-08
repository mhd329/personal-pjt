from django.urls import path
from .views import *

app_name = "todo"

urlpatterns = [
    path(
        "todolist",
        TodoListAPIView.as_view(),
    ),
    path(
        "todo/detail/<int:todo_pk>",
        TodoAPIView.as_view(),
    ),
    path(
        "all-todos",
        AllTodosAPIView.as_view(),
    ),
]
