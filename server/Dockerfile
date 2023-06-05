# BASE IMAGE
FROM node:18-alpine 

# The NODE_ENV environment variable specifies the environment in which an application is running (usually, development or production)
ENV NODE_ENV=production

# CREATES THE WORKING DIRECTORY IN THE CONTAINER
RUN mkdir -p /app
WORKDIR /app

# COPIES PACKAGE.JSON AND PACKAGE-LOCK.JSON FROM LOCAL TO CONTAINER
COPY package*.json ./

# INSTALLS THE DEPANDENCIES INSIDE THE CONTAINER
RUN npm install --production

# COPIES ALL THE CODE NEED FOR THE REACT APP FROM THE LOCAL TO CONTAINER
COPY . .

# SPECIFIES WHICH PORT WILL THE CONTAINER LISTEN TO
EXPOSE 4000

# DEFAULT COMMAND TO RUN
CMD [ "npm", "start" ]
