# client/Dockerfile
FROM node:lts

# Set the working directory
WORKDIR /app

# Copy package manifests first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your Next.js code
COPY . .

# Expose Next.js dev port
EXPOSE 3000

# Add a non-root user to run the app
RUN   chmod -R 777 ./app

# Check dependencies (useful for Cesium)
RUN npm install

# Run Next.js in dev mode
CMD ["npm", "run", "dev"]