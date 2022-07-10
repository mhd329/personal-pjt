import os
import random
import discord
import getData
from discord.ext import commands

token_path = os.path.dirname(os.path.abspath(__file__)) + '/token.txt'
with open(token_path, "r", encoding = "utf-8") as t:
    token = t.read()

game = discord.Game("전적 검색")



# 접두어, 상태, 활동상태 등 설정
bot = commands.Bot (command_prefix = '!!', status = discord.Status.online, activity = game)

@bot.event
async def on_ready():
    print("====================")
    print(bot.user.name)
    print(bot.user.id)
    print("====================")

@bot.command(aliases = ["p", "핑", "서버 핑"])
async def ping(ctx):
    await ctx.send(f'현재 핑 : {round(round(bot.latency, 4)*1000)}ms')

@bot.command(aliases = ["바보", "바보야", "멍청이", "메롱"])
async def ddong(ctx):
    randNum = str(random.randint(1, 6))
    
    chirp = {
            '1' : f'{ctx.author.mention}은(는) 바보래요!',
            '2' : '인간 시대의 끝이 도래했다.',
            '3' : '메롱',
            '4' : f'seratec 은 {ctx.author.mention}을(를) 무시합니다.',
            '5' : f'{ctx.author.mention} : 멍멍!',
            '6' : f'{ctx.author.mention} : 메에에~~~!'
            }
    
    await ctx.send(chirp[randNum])

@bot.command(aliases = ["서버 정보", "서버 상태"])
async def status(ctx):
    members = [member.name for member in ctx.guild.members]
    await ctx.send("{} 서버 사용 중\n총 {} 명.".format(ctx.guild.region,members, ctx.guild.member_count))

@bot.command(aliases = ["안녕", "hi", "Hi", "안녕하세요"])
async def hello(ctx):
    await ctx.send(f"{ctx.author.mention}님 반가워요!")

@bot.command(aliases = ["주사위, dice, random"])
async def roll(ctx):
    await ctx.send(f"{ctx.author.mention}님은 {random.randint(1, 100)}이(가) 나왔습니다. (1 ~ 100)")

@bot.command(aliases = ["참가", "초대", "들어와", "어서와", "in"])
async def join(ctx):
    channel = ctx.author.voice.channel
    await channel.connect()

@bot.command(aliases = ["퇴장", "나가", "떠나", "out", "잘가"])
async def leave(ctx):
    await bot.voice_clients[0].disconnect()

@bot.command(aliases = ["검색", "search", "찾기", "전적"])
async def s(ctx, summonerName, Number_of_searches):
    ebd = discord.Embed (title = 'Seratec Bot', description = '리그오브레전드 전적검색 봇', color = 0xF6BB43)
    ebd.add_field (name = summonerName, value = getData.run_a_search(summonerName, Number_of_searches), inline = False)
    ebd.set_footer (text = 'Seratec Bot')
    await ctx.send (embed = ebd)

@bot.command(aliases = ["도움말", "도움", "사용법", "명령어"])
async def h(ctx):
    ebd = discord.Embed (title = 'Seratec Bot', description = '리그오브레전드 전적검색 봇', color = 0xF6BB43)
    ebd.add_field (name = '접두사', value = ' "!!" 로 사용할 수 있어요...\nex) !!hello', inline = False)
    ebd.add_field (name = '1. 인사', value = '!!hello', inline = False)
    ebd.add_field (name = '2. 주사위', value = '!!roll (1 ~ 100 사이 랜덤)', inline = False)
    ebd.add_field (name = '3. 전적 검색', value = '!!검색 (아이디) (검색 횟수)', inline = False)
    ebd.set_footer (text = '검색 횟수가 5판 미만일 시 검색하지 않음')
    await ctx.send (embed = ebd)

bot.run(token)