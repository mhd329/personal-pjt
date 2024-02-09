#!/bin/bash
# cd ~/Steam/steamapps/common/PalServer >>> Change to move the path within the screen.
SESSION_NAME="palserver-screen"
if screen -ls | grep -q "$SESSION_NAME"; then
    echo "The server is already running."
else
    echo "Start the server."
    screen -dmS "$SESSION_NAME"
    sleep 1
    screen -S "$SESSION_NAME" -p 0 -X stuff "cd ~/Steam/steamapps/common/PalServer"
    screen -S "$SESSION_NAME" -p 0 -X stuff $'\n'
    screen -S "$SESSION_NAME" -p 0 -X stuff "./PalServer.sh -useperfthreads -NoAsyncLoadingThread -UseMultithreadForDS"
    screen -S "$SESSION_NAME" -p 0 -X stuff $'\n'
    echo "The server is now running."
fi
# 스크린 탈출