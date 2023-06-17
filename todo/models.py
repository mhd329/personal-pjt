from django.db import models
from config.timestamping import TimeStampedModel
from config.settings import AUTH_USER_MODEL

# Create your models here.


# 메인 모델
class Todo(TimeStampedModel):
    IMPORTANCE = (
        ("low", "낮음"),
        ("middle", "중간"),
        ("high", "높음"),
    )
    user = models.ForeignKey(
        AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="todos"
    )
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    importance = models.CharField(max_length=6, choices=IMPORTANCE, default="low")
    complete = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    class Meta:
        db_table = "Todo"
