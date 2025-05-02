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

RUN   chmod -R 777 ./app


# Run Next.js in dev mode
CMD ["npm", "run", "dev"]
