#!/bin/bash

echo "Install steamCMD."
sleep 1
sudo apt update
sudo add-apt-repository multiverse; sudo dpkg --add-architecture i386
sleep 1
echo -e '\n'

sudo apt update
sudo DEBIAN_FRONTEND=noninteractive apt install -y steamcmd
echo "SteamCMD installation completed."
sleep 1

echo "스팀 cmd가 정상적으로 설치되었다면 next를 입력하여 다음 단계로 진행해주세요."
read answer

if [ "$answer" == "next" ]; then
    ./palworld.sh
else
    echo "작업이 중단되었습니다."
fi