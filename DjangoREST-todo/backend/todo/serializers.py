from rest_framework import serializers
from .models import Todo


class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = (
            "id",
            "title",
            "importance",
            "complete",
        )


class TodoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = (
            "user",
            "title",
            "description",
            "importance",
        )


# 여기서 날짜 데이터를 보기 쉽게 수정해서 프론트엔트로 넘겨줄 수 있지만
# 그렇게 되면 프론트에서 백으로 넘어오는 데이터를 다시 백의 형식에 맞게 가공해야 했다.
# 그러면 작업량이 많아지므로 프론트엔드에서 보여줄 때만 변환해서 보여주는 것으로 했다.
class TodoDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = "__all__"


class TodoChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = "__all__"
