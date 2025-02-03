# Use the Debian-based Node 
FROM node:18

WORKDIR /app

# 1) Create a new CRA app
RUN npx create-react-app .

# 2) Install Tailwind + PostCSS
RUN npm install --save-dev tailwindcss postcss autoprefixer

# 3) Initialize Tailwind
RUN npx tailwindcss init -p

EXPOSE 3000
CMD ["npm", "start"]
