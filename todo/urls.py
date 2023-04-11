from django.urls import path
from .views import *


urlpatterns = [
    path(
        "all-todos",
        TodosAPIView.as_view(),
    ),
    path(
        "writing",
        TodosAPIView.as_view(),
    ),
    path(
        "check/<int:todo_pk>",
        TodoAPIView.as_view(),
    ),
    path(
        "renewal/<int:todo_pk>",
        TodoAPIView.as_view(),
    ),
]
