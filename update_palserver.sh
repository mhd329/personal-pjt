#!/bin/bash
SESSION_NAME="palserver-screen"
if screen -ls | grep -q "$SESSION_NAME"; then
    echo "Found a server that is currently running."
    cd ~
    ./close_palserver.sh
fi
sleep 1
steamcmd +login anonymous +app_update 2394010 validate +quit
echo "Update completed."