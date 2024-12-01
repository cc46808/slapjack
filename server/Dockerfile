FROM node:18-alpine

WORKDIR /app

# Copy only package files first for better caching
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy server source code
COPY server/src ./src

EXPOSE 3001
CMD ["npm", "start"]