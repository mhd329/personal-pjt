from discord.ext import commands
from .BaseSetting import BaseSetting

class Commands(BaseSetting):
    '''
    봇 명령어 관리 클래스.
    '''
    async def ping(self):
        await 