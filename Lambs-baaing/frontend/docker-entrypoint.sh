echo "Wait EXPRESS server."
dockerize -wait tcp://backend:5000 -timeout 10s
echo "Start React server."
npm run start