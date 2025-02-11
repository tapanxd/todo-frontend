# Use an official Node.js runtime as a base image
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire frontend code
COPY . .

# Build the frontend (Vite)
RUN npm run build

# Use Nginx to serve the frontend
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for the frontend
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
