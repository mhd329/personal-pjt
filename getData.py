import sys
import requests
from urllib import parse

def run_a_search(summonerName, Number_of_searches):

    summonerName_lower = summonerName.replace(" ","").lower()
    encoding_summonerName = parse.quote(summonerName_lower)

    ten = 2
    pos = 10**ten

    winning_games = [] # 이긴 게임의 고유값들 리스트
    losing_streak = 0 # 연패
    winning_streak = 0 # 연승

    api_key = "RGAPI-78191669-2f56-4f9f-b6d9-b456db6c7208"
    api_url = f'https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/{encoding_summonerName}'
    headers =\
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
        "Origin": "https://developer.riotgames.com",
        "X-Riot-Token": api_key
    }
    res = requests.get(api_url, headers = headers)
    data = res.json()
    puu_Id = data['puuid']

    if Number_of_searches.isdigit():
        if int(Number_of_searches) < 5:
            return ("5 회 미만은 검색되지 않습니다.")
        else:
            Number_of_searches = Number_of_searches
            match_Id_list = f'https://asia.api.riotgames.com/lol/match/v5/matches/by-puuid/{puu_Id}/ids?start=0&count={Number_of_searches}'
            requested_Id_list = requests.get(match_Id_list, headers = headers)
            Id_list = requested_Id_list.json()
    else:
        return ("숫자를 입력해주세요 !!!\n")


    requested_url = [] # https://asia.api.riotgames.com/lol/match/v5/matches/KR_5984014892

    for i in range(len(Id_list)):
        requested_url.append(f'https://asia.api.riotgames.com/lol/match/v5/matches/{Id_list[i]}')
        
    solo_rank_game = [] # 해당 랭크게임 승 패 여부, 게임 참여자들 아이디 등이 담겨있는 dic 을 원소로 가지는 list
    for j in range(len(requested_url)):
        requested_game_data = requests.get(requested_url[j], headers = headers)
        if requested_game_data.json()['info']['queueId'] == 420:
            solo_rank_game.append(requested_game_data.json())

    else:
        pass

    players_data = []
    for k in range(len(solo_rank_game)):
        for l in range(10):
            players_data.append(solo_rank_game[k]['info']['participants'][l])

    for n in range(len(players_data)): # 찾으려는 사람의 승 패 여부
        if (players_data[n]['summonerName'].replace(" ","").lower() == summonerName_lower) and (players_data[n]['win'] == True):
            winning_games.append(Id_list[i])

    return (f"최근 솔로 랭크 게임 횟수는 전체 {Number_of_searches} 게임 중 {len(solo_rank_game)} 회 입니다.\n그 중 {len(winning_games)} 회 승리하였습니다. (승률 {(len(winning_games) / len(solo_rank_game) * 100 * pos + 0.5) // 1 / pos}%)")
    