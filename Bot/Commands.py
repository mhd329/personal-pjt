from discord import app_commands
from .Settings import Settings
from Log.Settings import logger


class Commands(Settings):
    '''
    봇 명령어 관리 클래스.
    '''
    def __init___(self):
        super().__init__()
    
    @app_commands.command(name="ping")
    async def ping(self, ctx):
        await ctx.send("pong!")