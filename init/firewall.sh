#!/bin/bash

sudo apt update
echo "Install netfilter-persistent."
sleep 1
sudo apt install netfilter-persistent
echo "Netfilter-persistent installation completed."
sleep 1

sudo iptables -I INPUT -p tcp --dport 27015 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 27016 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 25575 -j ACCEPT
sudo iptables -I INPUT -p udp --dport 27015 -j ACCEPT
sudo iptables -I INPUT -p udp --dport 27016 -j ACCEPT
sudo iptables -I INPUT -p udp --dport 25575 -j ACCEPT
sudo iptables -I INPUT -p udp --dport 8211 -j ACCEPT
sudo iptables -S

echo "Check open ports."
sudo iptables -nL

echo "방화벽 설정이 정상적으로 끝났다면 next를 입력하여 다음 단계로 진행해주세요."
read answer

if [ "$answer" == "next" ]; then
    ./steam.sh
else
    echo "작업이 중단되었습니다."
fi