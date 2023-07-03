from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.authentication import (
    JWTAuthentication,
    InvalidToken,
    TokenError,
)


class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            print("header is None")
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            print("raw_token is None")
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token

    def get_validated_token(self, raw_token):
        messages = []
        for AuthToken in api_settings.AUTH_TOKEN_CLASSES:
            try:
                return AuthToken(raw_token)
            except TokenError as e:
                messages.append(
                    {
                        "token_class": AuthToken.__name__,
                        "token_type": AuthToken.token_type,
                        "message": e.args[0],
                    }
                )
        # 수정이 필요한 부분은 이 부분이었다.
        raise InvalidToken(
            {
                "detail": messages,
                "message": "유효하지 않은 토큰입니다.",
            }
        )