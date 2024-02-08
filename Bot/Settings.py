from discord import Game, Status, Intents, Object
from discord.ext import commands
from Log.Settings import logger


intents = Intents.default()
intents.message_content = True


class Settings(commands.Bot):
    '''
    기본적인 접두어 등 봇 설정 관리 클래스.
    '''
    def __init__(self, server_id):
        super().__init__(
            command_prefix="!!",
            intents=intents,
        )
        self.server_id = server_id

    async def setup_hook(self):
        try:
            self.tree.copy_global_to(guild=Object(id=self.server_id))
            await self.tree.sync(guild=Object(id=self.server_id))
            logger.info("Setup pass.")
        except Exception as error:
            logger.error(error)

    async def on_ready(self):
        try:
            activity = Game("서버 모니터링중")
            await self.change_presence(status=Status.online, activity=activity)
            logger.info("Start.")
        except Exception as error:
            logger.error(error)
