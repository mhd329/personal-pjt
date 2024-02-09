import os
import random
import asyncio
import subprocess
from discord import Embed, Color, Message
from discord.ext import commands
from Log.Settings import logger, logger_detail


class Commands(commands.Cog):
    '''
    봇 명령어 관리 클래스.
    '''
    def __init__(self, bot):
        self.bot = bot
        self.emo_list = (":grinning:", ":partying_face:", ":star_struck:", ":sunglasses:", ":cowboy:",)
        self.funny_list = ("으거려으", "으으으", "으?", "으",":grimacing:", ":face_with_spiral_eyes:",)

    def check_server(self):
        try:
            server_ip = subprocess.check_output("curl -s https://ipinfo.io/ip", shell=True, universal_newlines=True).strip()
            subprocess.call("./get_palserver.sh", shell=True)
            with open("./palserver_pid.txt", 'r') as f:
                content = f.read()
                msg = "닫혀있음."
                state_color = Color.red()
                image_url="https://cdn.discordapp.com/attachments/995736483854036994/1205592081553166487/x.png?ex=65d8ee1f&is=65c6791f&hm=2b5695918f375cb7a187bd3a5023b2a0aec938a3f090ee617a9f55217dd76ab5&"
                result = "00:00"
                if content.strip():
                    try:
                        result = subprocess.check_output("./check_palserver.sh", shell=True, universal_newlines=True).strip()
                        msg = f"가동중..."
                        state_color = Color.green()
                        image_url="https://cdn.discordapp.com/attachments/995736483854036994/1205594709817303150/check.png?ex=65d8f091&is=65c67b91&hm=e786e3b318775aa822b0bbb1dd7b119ad7a7672232b1fa81574e24347774208f&"
                    except Exception as error:
                        logger.error("ERROR : log_detail_palserver.log 참조")
                        logger_detail.error(error)
            ebd = Embed(title=f"\n:eyes: 서버 상태\n{msg}", description=f"\n\n:bulb: 서버 실행시간\n\t{result}\n\n:globe_with_meridians: 서버 아이피\n\t{server_ip}:8211\n", color=state_color)
            ebd.set_thumbnail(url=image_url)
            ebd.set_author(name=self.bot.user.display_name, icon_url = self.bot.user.display_avatar)
            return ebd
        except FileNotFoundError:
            logger.info("palserver_pid.txt 파일 없음.")
            error_msg = f"해당 위치({os.getcwd()})에서 서버 상태를 확인할 수 없습니다."
            raise error_msg
        except Exception as error:
            logger.error("ERROR : log_detail_palserver.log 참조")
            logger_detail.error(error)
            error_msg = f"서버 상태를 확인할 수 없습니다."
            raise error_msg

    async def run_command(self, command):
        proc = await asyncio.create_subprocess_shell(command, shell=True)
        await proc.wait()

    @commands.command(name="으")
    async def funny_sound(self, ctx):
        await ctx.send(f"{self.funny_list[random.randrange(len(self.funny_list))]}")

    @commands.command(aliases=["인사", "안녕"])
    async def hello(self, ctx):
        await ctx.send(f"{ctx.author.display_name}님, 안녕하세요! {self.emo_list[random.randrange(len(self.emo_list))]}")

    @commands.command(aliases=["명령", "명령어"])
    async def find_command(self, ctx):
        ebd = Embed(title="명령어 모음", description="서버 원격 조종 명령어 모음 안내입니다.\n자세한 사항은 [여기](https://github.com/mhd329/palserver-remote-control)를 참조하세요.\n```md\n 1. [!!핑][서버 핑 확인하기.]\n\n 2. [!!인사][봇과 인사하기.]\n\n 3. [!!명령][봇 명령어 확인.]\n\n 4. [!!상태][서버 상태 확인.]\n\n 5. [!!열기][서버 열기.]\n\n 6. [!!닫기][서버 닫기.]\n\n 7. [!!업데이트][서버 업데이트.]\n```")
        ebd.set_thumbnail(url="https://cdn.discordapp.com/attachments/995736483854036994/1205592066768379944/cogs.png?ex=65d8ee1b&is=65c6791b&hm=ecb652eceda7a55fca809a5641e64ccdaad6a95ee90040f4c2c5e016972bef33&")
        ebd.set_author(name=self.bot.user.display_name, icon_url = self.bot.user.display_avatar)
        ebd.set_footer(text = f"{ctx.message.author.display_name}", icon_url = ctx.message.author.display_avatar)
        await ctx.send(embed = ebd)
        del ebd

    @commands.command(aliases=["핑"])
    async def ping(self, ctx):
        msg = await ctx.send(":ping_pong:")
        latency = round((msg.created_at - ctx.message.created_at).microseconds // 1000)
        api_latency = round(self.bot.latency * 1000)
        ping_color=Color.red()
        result = "늦음"
        if latency < 501:
            ping_color=Color.yellow()
            result = "보통 "
        if latency < 201:
            ping_color=Color.green()
            result = "빠름"
        ebd = Embed(title="측정 결과", description=f"```\n속도 : {result}\n**Latency** : `{latency}ms`\n**API Latency** : `{api_latency}ms`\n**위 수치들은 인게임 서버 상태와는 무관합니다.**\n```", color=ping_color)
        ebd.set_thumbnail(url="https://cdn.discordapp.com/attachments/995736483854036994/1205592106110820383/android.png?ex=65d8ee24&is=65c67924&hm=1106bc390dc587d8b5a328d23dd03a515fda2a178761aa62ca7f3914edc7ce6c&")
        ebd.set_author(name=self.bot.user.display_name, icon_url = self.bot.user.display_avatar)
        ebd.set_footer(text = f"{ctx.message.author.display_name}", icon_url = ctx.message.author.display_avatar)
        await msg.edit(embed = ebd)
        del ebd

    @commands.command(name="상태")
    async def state(self, ctx):
        try:
            ebd = await asyncio.to_thread(self.check_server)
            ebd.set_footer(text = f"{ctx.message.author.display_name}", icon_url = ctx.message.author.display_avatar)
            await ctx.send(embed = ebd)
            del ebd
        except Exception as error:
            await ctx.send(error)

    @commands.command(name="열기")
    async def open_server(self, ctx):
        msg = await ctx.send("서버를 시작합니다. 잠시만 기다려주세요...")
        try:
            await self.run_command("./run_palserver.sh")
            try:
                ebd = await asyncio.to_thread(self.check_server)
                ebd.set_footer(text = f"{ctx.message.author.display_name}", icon_url = ctx.message.author.display_avatar)
                await msg.edit(embed = ebd)
                del ebd
            except Exception as error:
                await ctx.send(error)
        except FileNotFoundError:
            logger.info("run_palserver.sh 파일 없음.")
            logger_detail.error(error)
            await ctx.send(f"해당 위치({os.getcwd()})에 실행 스크립트가 존재하지 않습니다.")
        except Exception as error:
            logger.error("ERROR : log_detail_palserver.log 참조")
            logger_detail.error(error)
            await ctx.send(error)

    @commands.command(name="닫기")
    async def close_server(self, ctx):
        msg = await ctx.send("서버를 종료합니다. 잠시만 기다려주세요...")
        try:
            await self.run_command("./close_palserver.sh")
            try:
                ebd = await asyncio.to_thread(self.check_server)
                ebd.set_footer(text = f"{ctx.message.author.display_name}", icon_url = ctx.message.author.display_avatar)
                await msg.edit(embed = ebd)
                del ebd
            except Exception as error:
                await ctx.send(error)
        except FileNotFoundError:
            logger.info("close_palserver.sh 파일 없음.")
            await ctx.send(f"해당 위치({os.getcwd()})에 종료 스크립트가 존재하지 않습니다.")
        except Exception as error:
            logger.error("ERROR : log_detail_palserver.log 참조")
            logger_detail.error(error)

    @commands.command(name="업데이트")
    async def update_server(self, ctx):
        msg = await ctx.send("업데이트 중입니다. 잠시만 기다려주세요...")
        try:
            await self.run_command("./update_palserver.sh")
            ebd = Embed(title="업데이트", description="https://store.steampowered.com/news/app/1623730")
            ebd.set_thumbnail(url="https://cdn.discordapp.com/attachments/995736483854036994/1205592106110820383/android.png?ex=65d8ee24&is=65c67924&hm=1106bc390dc587d8b5a328d23dd03a515fda2a178761aa62ca7f3914edc7ce6c&")
            ebd.set_author(name=self.bot.user.display_name, icon_url = self.bot.user.display_avatar)
            ebd.set_footer(text = f"{ctx.message.author.display_name}", icon_url = ctx.message.author.display_avatar)
            await msg.edit(embed = ebd)
        except FileNotFoundError:
            logger.info("update_palserver.sh 파일 없음.")
            await ctx.send(f"해당 위치({os.getcwd()})에 업데이트 스크립트가 존재하지 않습니다.")
        except Exception as error:
            logger.error("ERROR : log_detail_palserver.log 참조")
            logger_detail.error(error)
            await ctx.send("예상치 못한 예외가 발생했습니다.")
