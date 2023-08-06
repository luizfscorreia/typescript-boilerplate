FROM node

WORKDIR /usr/app

COPY package.json ./

COPY tsconfig.json ./

RUN apt-get update

RUN apt-get install -y --no-install-recommends ffmpeg 

RUN npm install -force

RUN npm run build

RUN mkdir /temp

COPY . .

EXPOSE 3333

CMD ["pm2-runtime", "app.js"]