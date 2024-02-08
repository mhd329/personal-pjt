#!/bin/bash
cd ~/Steam/steamapps/common/PalServer
screen -S "palserver-screen"
# 스크린 진입
echo -ne "\n"
./PalServer.sh -useperfthreads -NoAsyncLoadingThread -UseMultithreadForDS
screen -X detach
exit
# 스크린 탈출