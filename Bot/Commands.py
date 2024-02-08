import subprocess
from time import sleep
from discord import Embed, Color
from discord.ext import commands
from Log.Settings import logger


class Commands(commands.Cog):
    '''
    봇 명령어 관리 클래스.
    '''
    def __init__(self, bot):
        self.bot = bot

    async def check_server(self, ctx):
        try:
            server_ip = subprocess.check_output(["sh", "curl", "-s", "https://ipinfo.io/ip"], universal_newlines=True).strip()
            subprocess.call(["sh", "~/get_palserver.sh"])
            with open("~/palserver_pid.txt", 'r') as f:
                content = f.read()
                msg = "현재 서버 닫혀있음."
                state_color = Color.red()
                if content:
                    result = subprocess.check_output(["sh", "~/check_palserver.sh"], universal_newlines=True).strip()
                    msg = f"서버 실행중..."
                    state_color = Color.green()
            ebd = Embed(title="서버 상태", description="서버 상태 확인창", color=state_color)
            ebd.add_field(name="서버 상태", value=msg, inline=False)
            ebd.add_field(name="서버 아이피", value=server_ip, inline=False)
            ebd.add_field(name="서버 실행시간", value=result, inline=False)
            await ctx.send(ebd)
            del ebd
        except FileNotFoundError:
            logger.info("palserver_pid.txt 파일 없음.")
            await ctx.send("해당 위치에서 서버 정보를 확인할 수 없습니다.")

    @commands.command(name="인사")
    async def hello(self, ctx):
        await ctx.send(f"{ctx.author.display_name}님, 안녕하세요.")

    @commands.command(name="핑")
    async def ping(self, ctx):
        msg = await ctx.send("핑 측정 시작.")
        latency = round((msg.created_at - ctx.message.created_at).microseconds // 1000)
        api_latency = round(self.bot.latency * 1000)
        ping_color=Color.red()
        result = "심각"
        if latency < 501:
            ping_color=Color.yellow()
            result = "보통"
        if latency < 201:
            ping_color=Color.green()
            result = "원활"
        ebd = Embed(title="핑", description="결과", color=ping_color)
        ebd.add_field(name="Latency", value=f"{latency}ms", inline=False)
        ebd.add_field(name="API Latency", value=f"{api_latency}ms", inline=False)
        ebd.add_field(name="API Latency", value=f"{api_latency}ms", inline=False)
        ebd.add_field(name="참고", value=f"여기서의 핑은 인게임 서버 상태와는 무관합니다.", inline=False)
        await ctx.send(embed = ebd)
        del ebd

    @commands.command(name="명령어")
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
        self.check_server(ctx)

    @commands.command(name="열기")
    async def open_server(self, ctx):
        try:
            subprocess.call(["sh", "~/run_palserver.sh"])
            sleep(7)
            self.check_server(ctx)
        except FileNotFoundError:
            logger.info("run_palserver.sh 파일 없음.")
            await ctx.send("해당 위치에 실행 스크립트가 존재하지 않습니다.")

    @commands.command(name="닫기")
    async def close_server(self, ctx):
        try:
            subprocess.call(["sh", "~/close_palserver.sh"])
            sleep(7)
            self.check_server(ctx)
        except FileNotFoundError:
            logger.info("close_palserver.sh 파일 없음.")
            await ctx.send("해당 위치에 종료 스크립트가 존재하지 않습니다.")

    @commands.command(name="업데이트")
    async def update_server(self, ctx):
        try:
            subprocess.call(["sh", "~/update_palserver.sh"])
            await ctx.send("업데이트 완료.")
        except FileNotFoundError:
            logger.info("update_palserver.sh 파일 없음.")
            await ctx.send("해당 위치에 업데이트 스크립트가 존재하지 않습니다.")
