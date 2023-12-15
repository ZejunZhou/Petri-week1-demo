# Fetching the latest node image on alpine linux
FROM node:alpine AS development

WORKDIR /react-app

# Declaring env
ENV NODE_ENV development

# Installing dependencies
COPY ./package.json .
COPY ./package-lock.json .

RUN npm ci

# Copying all the files in our project
COPY . .

# Starting our application
RUN npm run build

# 构建应用
RUN npm run build

# 复制启动脚本到镜像
COPY ./startup.sh /startup.sh
RUN chmod +x /startup.sh

# 使用自定义的启动脚本作为启动命令
CMD ["/startup.sh"]
