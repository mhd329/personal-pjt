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


class TodoDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = "__all__"


class TodoChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = "__all__"
