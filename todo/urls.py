from django.urls import path
from .views import *


urlpatterns = [
    path(
        "todo",
        TodosAPIView.as_view(),
    ),
    path(
        "todo/<int:todo_pk>",
        TodoAPIView.as_view(),
    ),
    path(
        "all-todos",
        AllTodosAPIView.as_view(),
    ),
]
