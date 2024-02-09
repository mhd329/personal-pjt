#!/bin/bash
cd ~
./get_palserver.sh
pid=$(<./palserver_pid.txt)
echo "check_palserver.sh -> Palserver PID : $pid"
ps -p "$pid" -o etime --no-headers