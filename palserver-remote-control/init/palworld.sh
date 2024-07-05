#!/bin/bash

echo "Install game engine."
sleep 1
steamcmd +login anonymous +app_update 2394010 validate +quit
echo "Palserver installation completed."
sleep 1

echo "Install SDK64."
sleep 1
mkdir -p ~/.steam/sdk64/
steamcmd +login anonymous +app_update 1007 +quit
cp ~/Steam/steamapps/common/Steamworks\ SDK\ Redist/linux64/steamclient.so ~/.steam/sdk64/
echo "SDK64 installation completed."
sleep 1

echo "Server initialization."
sleep 2
cd ~/Steam/steamapps/common/PalServer
./PalServer.sh