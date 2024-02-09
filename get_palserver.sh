#!/bin/bash
pid=$(ps -ef | grep "./PalServer.sh" | grep -v "grep" | head -n 1 | awk '{print $1}')
echo "$pid" > ./palserver_pid.txt