FROM node:20
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5000
CMD ["node", "api/index.js"]
