from django.urls import path
from .views import *

app_name = "todo"

urlpatterns = [
    path(
        "todolist",
        TodosAPIView.as_view(),
    ),
    path(
        "todolist/<int:todo_pk>",
        TodoAPIView.as_view(),
    ),
    path(
        "all-todos",
        AllTodosAPIView.as_view(),
    ),
]
