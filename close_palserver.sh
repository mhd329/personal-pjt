#!/bin/bash
SESSION_NAME="palserver-screen"
if screen -ls | grep -q "$SESSION_NAME"; then
    # 스크린 진입
    cd ~
    ./get_palserver.sh
    pid=$(<./palserver_pid.txt)
    screen -x "$SESSION_NAME"
    kill -2 "$pid"
    exit
    # 스크린 탈출
else
    echo "스크린 찾을 수 없음."
fi