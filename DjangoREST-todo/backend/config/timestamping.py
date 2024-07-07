from django.db import models
from django.utils import timezone


class TimeStampedModel(models.Model):
    # 최초 등록 시간 수정 불가
    # default=timezone.now >>> 현지 시각으로 설정 (기본은 UTC)
    created_at = models.DateTimeField(
        default=timezone.now, editable=False, verbose_name="생성됨"
    )
    updated_at = models.DateTimeField(
        null=True, blank=True, auto_now_add=False, verbose_name="수정됨"
    )

    # 추상 클래스 설정 >>> 상속을 통해서만 구현 가능
    class Meta:
        abstract = True

    # save 메서드 호출 시 updated_at 갱신
    def save(self, *args, **kwargs):
        self.updated_at = timezone.localtime()
        super().save(*args, **kwargs)
