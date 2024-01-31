FROM node:20
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5000
EXPOSE 9229
CMD ["node", "--inspect-brk=0.0.0.0:9229", "api/index.js"]