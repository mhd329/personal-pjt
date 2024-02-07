import os
import discord
from dotenv import load_dotenv


from Bot import Commands


load_dotenv()


token_bot = os.getenv("TOKEN_BOT")
token_server = os.getenv("TOKEN_SERVER_DEBUG")

from discord.ext import commands
from discord import Game, Status,Intents
from Log.Settings import logger


intents = Intents.default()
intents.message_content = True

bot = Commands(token_server, intents=intents)

# tree = app_commands.CommandTree(custom_commands)
# @tree.command(name = "Time", description = "Gives TIme")
# async def time(interaction):
#     await interaction.response.send_message(f"It is {datetime.now(timezone.utc)} UTC.")

if __name__ == "__main__":
    bot.run(token_bot)