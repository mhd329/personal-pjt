#!/bin/bash
cd ~
./get_palserver.sh
pid=$(<palserver_pid.txt)
ps -p "$pid" -o etime --no-headers