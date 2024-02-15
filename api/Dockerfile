# я бы хотел поставить alpine, но тогда на arm
# процессоре не запускаются бинарники prisma и argon2
#
# slim версия образа тоже вроде пойдет

FROM node:20-slim As development

WORKDIR /api

RUN apt-get -y update
RUN apt-get -y upgrade

RUN apt-get -y install python3 make g++ openssl procps

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run prisma:generate

EXPOSE 80

FROM node:16-slim as production

WORKDIR /api

RUN apt-get -y update
RUN apt-get -y upgrade

RUN apt-get -y install python3 make g++ openssl procps

COPY package*.json ./

RUN npm ci

RUN npm run prisma:generate
RUN npm run build

COPY . .

CMD ["npm", "run", "start:prod"]

EXPOSE 80
