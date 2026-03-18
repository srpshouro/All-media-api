FROM node:18

# Install Python and FFmpeg
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "node", "api.js" ]
