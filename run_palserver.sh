#!/bin/bash
cd ~/Steam/steamapps/common/PalServer
SESSION_NAME="palserver-screen"
if screen -ls | grep -q "$SESSION_NAME"; then
    echo "서버가 이미 실행중입니다."
else
    screen -S "$SESSION_NAME"
    # 스크린 진입
    echo -ne "\n"
    ./PalServer.sh -useperfthreads -NoAsyncLoadingThread -UseMultithreadForDS
    screen -X detach
    exit
fi
# 스크린 탈출