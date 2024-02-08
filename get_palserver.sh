#!/bin/bash
pid=$(ps -ax | grep "./PalServer.sh -useperfthreads -NoAsyncLoadingThread -UseMultithreadForDS" | grep -v "grep" | head -n 1 | awk '{print $1}')
echo "$pid" > ~/palserver_pid.txt