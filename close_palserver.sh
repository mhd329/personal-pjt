#!/bin/bash
SESSION_NAME="palserver-screen"
if screen -ls | grep -q "$SESSION_NAME"; then
    echo "Shut down the currently running server."

    # Gets the palserver pid.
    # cd ~
    # ./get_palserver.sh
    # pid=$(<./palserver_pid.txt)
    pid=$(ps -ax | grep "./PalServer.sh" | grep -v "grep" | head -n 1 | awk '{print $1}') # Script to run the server. 

    # Forwarding commands into the screen
    screen -S "$SESSION_NAME" -p 0 -X stuff "^C"
    WAIT_TIME=3
    while [ -e /proc/$pid ]; do
    # while ps -ax | grep -q "$pid" | grep -v "grep"; do
        sleep $WAIT_TIME
    done

    echo "Server shut down."
    screen -XS "$SESSION_NAME" quit
    echo "Screen shut down."
else
    echo "The screen was not found."
fi