FROM node
WORKDIR /server
COPY package.json /server/
COPY . /server/
RUN npm install
#CMD ["npm", "start"]
CMD ["npm", "run", "dev"]
