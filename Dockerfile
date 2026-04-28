FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
# Non-root user for security
RUN useradd -m securesenseuser
USER securesenseuser
EXPOSE 3000
CMD ["node", "app.js"]