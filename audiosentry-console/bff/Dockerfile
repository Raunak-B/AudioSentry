FROM node:20-alpine

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies deterministically
RUN npm ci

# Copy the rest of the source code
COPY . .

# Ensure standard Node.js security by running as non-root user
RUN chown -R node:node /app
USER node

EXPOSE 4000

CMD ["npm", "start"]
