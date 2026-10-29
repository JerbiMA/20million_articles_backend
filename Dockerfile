FROM node:20-alpine

WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Expose API port
EXPOSE 5000

# Start application
CMD ["node", "src/server.js"]
