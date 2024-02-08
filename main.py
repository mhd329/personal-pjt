import os
import sys
import asyncio
import subprocess
from dotenv import load_dotenv


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
        subprocess.call(["sh", "sudo", "shutdown", "-h", "now"])
        await interaction.response.send_message(f"서버 컴퓨터가 종료되었습니다.")
    bot.run(token_bot)