from discord.ext import commands
from discord import Game, Status,Intents
from Log.Settings import logger


intents = Intents.default()
intents.message_content = True


class Settings(commands.Bot):
    '''
    기본적인 접두어 등 봇 설정 관리 클래스.
    '''
    def __init___(self, server_id):
        super().__init__(
            command_prefix="!!",
            intents=intents,
        )
        self.server_id = server_id

    async def setup_hook(self):
        try:
            self.tree.copy_global_to(guild=self.server_id)
            await self.tree.sync(guild=self.server_id)
            await logger.info("Setup pass.")
        except Exception as error:
            logger.error(error)
            logger.error("Setup failed.")

    async def on_ready(self):
        try:
            activity = Game("서버 모니터링중")
            await self.change_presence(status=Status.online, activity=activity)
            await logger.info("Start.")
        except Exception as error:
            logger.error(error)
            logger.error("Failed to start.")


# Latency ctx.createdTimestamp
# API Latency ws.ping