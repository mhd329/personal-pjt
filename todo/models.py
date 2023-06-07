from django.db import models
from config.timestamping import TimeStampedModel
from config.settings import AUTH_USER_MODEL

# Create your models here.


# 메인 모델
class Todo(TimeStampedModel):
    user = models.ForeignKey(
        AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="todos"
    )
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    important = models.BooleanField(default=False)
    complete = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    class Meta:
        db_table = "Todo"
