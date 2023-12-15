sleep 80

# get Ngrok URL
NGROK_URL=$(curl -s http://ngrok:4040/api/tunnels | jq -r '.tunnels[] | select(.name == "flask-backend") | .public_url')

# write .env file to react-app
echo "REACT_APP_BACKEND_URL=$NGROK_URL" > /react-app/.env