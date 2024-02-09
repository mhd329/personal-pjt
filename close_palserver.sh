#!/bin/bash
SESSION_NAME="palserver-screen"
if screen -ls | grep -q "$SESSION_NAME"; then
    echo "Shut down the currently running server."

    # Gets the palserver pid.
    cd ~
    ./get_palserver.sh
    pid=$(<./palserver_pid.txt)

    # Forwarding commands into the screen
    screen -S "$SESSION_NAME" -p 0 -X stuff "^C"
    WAIT_TIME=5
    # while [ -e /proc/$pid ]; do
    while ps -ax | grep -q "$pid"; do
        sleep $WAIT_TIME
    done

    echo "Server shut down."
    screen -XS "$SESSION_NAME" quit
    echo "Screen shut down."
else
    echo "The screen was not found."
fi