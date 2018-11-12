FROM node
LABEL maintainer="smorales@linets.cl"

ENV PORT 3000
WORKDIR /app
COPY package*.json .
RUN npm install
VOLUME /app/node_modules
COPY app.js .
COPY checklock.sh .
CMD node app.js
