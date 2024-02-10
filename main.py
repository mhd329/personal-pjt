import os
import sys
import asyncio
import subprocess
from dotenv import load_dotenv


from discord import Object
from Bot import Commands, Settings


load_dotenv()


token_bot = os.getenv("TOKEN_BOT")
token_server = os.getenv("TOKEN_SERVER")


if __name__ == "__main__":
    if "debugpy" in sys.modules:
        token_server = os.getenv("TOKEN_SERVER_DEBUG")
    bot = Settings(server_id=token_server)
    asyncio.run(bot.add_cog(Commands(bot)))

    @bot.tree.command(name = "종료", description = "서버 컴퓨터 종료.")
    async def terminate_server(interaction):
        await interaction.response.send_message("서버 컴퓨터를 종료합니다.")
        subprocess.call(["sudo shutdown -h now"], shell=True)

    @bot.tree.command(name = "재부팅", description = "서버 컴퓨터 재시작.")
    async def reboot_server(interaction):
        await interaction.response.send_message("서버 컴퓨터를 재시작합니다.")
        subprocess.call(["sudo shutdown -r now"], shell=True)

    bot.run(token_bot)