#!/bin/bash
cd ~
./scripts/get_palserver.sh
pid=$(<./scripts/palserver_pid.txt)
# echo "check_palserver.sh -> Palserver PID : $pid"
ps -p "$pid" -o etime --no-headers