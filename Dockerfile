FROM node:16-alpine
RUN mkdir -p /usr/src/server
WORKDIR /usr/src/server
COPY package.json package-lock.json /usr/src/server/
RUN npm ci --only=production
COPY . /usr/src/server
EXPOSE 3000
USER node
CMD ["npm", "start"]
