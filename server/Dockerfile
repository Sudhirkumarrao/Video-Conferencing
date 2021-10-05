FROM node



# Create app directory
WORKDIR /usr/src/app



COPY package*.json ./



RUN npm install
# If you are building your code for production
# RUN npm ci --only=production



# Bundle app source
COPY . .



RUN npm install



EXPOSE 3000
CMD [ "npm", "start" ]