import os
import asyncio
import subprocess
from discord import Embed, Color
from discord.ext import commands
from Log.Settings import logger, logger_detail


class Commands(commands.Cog):
    '''
    봇 명령어 관리 클래스.
    '''
    def __init__(self, bot):
        self.bot = bot

    def check_server(self):
        try:
            server_ip = subprocess.check_output("curl -s https://ipinfo.io/ip", shell=True, universal_newlines=True).strip()
            subprocess.call("./get_palserver.sh", shell=True)
            with open("./palserver_pid.txt", 'r') as f:
                content = f.read()
                msg = "닫혀있음."
                state_color = Color.red()
                result = "00:00"
                if content.strip():
                    try:
                        result = subprocess.check_output("./check_palserver.sh", shell=True, universal_newlines=True).strip()
                        msg = f"가동중..."
                        state_color = Color.green()
                    except Exception as error:
                        logger.error("ERROR : log_detail_palserver.log 참조")
                        logger_detail.error(error)
            ebd = Embed(title="서버 상태", description=msg, color=state_color)
            ebd.add_field(name="서버 아이피", value=f"{server_ip}:8211", inline=False)
            ebd.add_field(name="서버 실행시간", value=result, inline=False)
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

    @commands.command(aliases=["인사", "안녕"])
    async def hello(self, ctx):
        await ctx.send(f"{ctx.author.display_name}님, 안녕하세요.")

    @commands.command(aliases=["핑"])
    async def ping(self, ctx):
        msg = await ctx.send("핑 측정 시작.")
        latency = round((msg.created_at - ctx.message.created_at).microseconds // 1000)
        api_latency = round(self.bot.latency * 1000)
        ping_color=Color.red()
        result = "느림"
        if latency < 501:
            ping_color=Color.yellow()
            result = "보통"
        if latency < 201:
            ping_color=Color.green()
            result = "빠름"
        ebd = Embed(title="핑", description=f"결과 : {result}", color=ping_color)
        ebd.add_field(name="Latency", value=f"{latency}ms", inline=False)
        ebd.add_field(name="API Latency", value=f"{api_latency}ms", inline=False)
        ebd.set_footer(text=f"(참고) 이 수치는 인게임 서버 상태와는 무관합니다.")
        await ctx.send(embed = ebd)
        del ebd

    @commands.command(aliases=["명령", "명령어"])
    async def find_command(self, ctx):
        ebd = Embed(title="명령어 모음", description="서버 원격 조종 명령어 모음 안내입니다.")
        ebd.add_field(name="!!상태", value=f"서버 상태 확인", inline=False)
        ebd.add_field(name="!!열기", value=f"서버 열기", inline=False)
        ebd.add_field(name="!!닫기", value=f"서버 닫기", inline=False)
        ebd.add_field(name="!!업데이트", value=f"서버 업데이트", inline=False)
        await ctx.send(embed = ebd)
        del ebd

    @commands.command(name="상태")
    async def state(self, ctx):
        try:
            ebd = await asyncio.to_thread(self.check_server)
            await ctx.send(embed = ebd)
            del ebd
        except Exception as error:
            await ctx.send(error)

    @commands.command(name="열기")
    async def open_server(self, ctx):
        try:
            await self.run_command("./run_palserver.sh")
            try:
                ebd = await asyncio.to_thread(self.check_server)
                await ctx.send(embed = ebd)
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
        try:
            await self.run_command("./close_palserver.sh")
            try:
                ebd = await asyncio.to_thread(self.check_server)
                await ctx.send(embed = ebd)
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
        try:
            await self.run_command("./update_palserver.sh")
            await ctx.send("업데이트 완료.")
        except FileNotFoundError:
            logger.info("update_palserver.sh 파일 없음.")
            await ctx.send(f"해당 위치({os.getcwd()})에 업데이트 스크립트가 존재하지 않습니다.")
        except Exception as error:
            logger.error("ERROR : log_detail_palserver.log 참조")
            logger_detail.error(error)
            await ctx.send("예상치 못한 예외가 발생했습니다.")
