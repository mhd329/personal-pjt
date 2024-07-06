from django.urls import path
from .views import *

app_name = "todo"

urlpatterns = [
    path(
        "todo-list",
        TodoListAPIView.as_view(),
    ),
    path(
        "detail/<int:todo_pk>",
        TodoAPIView.as_view(),
    ),
    path(
        "all-todos",
        AllTodosAPIView.as_view(),
    ),
]
