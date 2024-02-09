#!/bin/bash
pid=$(ps -ax | grep "./PalServer.sh" | grep -v "grep" | head -n 1 | awk '{print $1}')
echo "$pid" > ./palserver_pid.txt
echo "get_palserver.sh -> Palserver PID : $pid"