#!/bin/bash
SESSION_NAME="palserver-screen"
if screen -ls | grep -q "$SESSION_NAME"; then
    cd ~
    ./close_palserver.sh
fi
steamcmd +login anonymous +app_update 2394010 validate +quit