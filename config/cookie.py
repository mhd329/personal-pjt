from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from dotenv import load_dotenv
import jwt
import os


class TokenAuthenticationHandler:
    @staticmethod
    def check_user_from_token(request):
        try:
            access = request.COOKIES["access"]
            load_dotenv()
            payload = jwt.decode(
                access, os.getenv("JWT_SECRET_KEY"), algorithms=["HS256"]
            )
            user_email = payload.get("email")
            user = get_object_or_404(get_user_model(), email=user_email)
            return user
        except KeyError:
            # 쿠키에 액세스 토큰이 존재하지 않음
            return None
        except jwt.exceptions.ExpiredSignatureError:
            # 액세스 토큰 기한 만료
            ...
        except jwt.exceptions.InvalidTokenError:
            # 사용할 수 없는 토큰
            ...
        except Exception as error:
            # 기타 서버 에러
            raise error
