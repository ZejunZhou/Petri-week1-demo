#!/bin/sh

# 检查 .env 文件是否存在，并且是否包含 REACT_APP_BACKEND_URL 变量
while [ ! -f "/react-app/.env" ] || ! grep -q "REACT_APP_BACKEND_URL" "/react-app/.env"; do
  echo "等待 .env 文件..."
  sleep 5
done

# 现在 .env 文件存在，可以启动 React 应用
cd /react-app
npm start