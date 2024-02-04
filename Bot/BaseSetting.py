import discord
from discord.ext import commands

intents = discord.Intents.default()
intents.message_content = True

class BaseSetting(commands.Bot):
    '''
    기본적인 접두어 등 봇 설정 관리 클래스.
    '''
    def __init___(self):
        super().__init__(
            command_prefix="!!",
            intents=intents,
        )

    async def on_ready(self):
        