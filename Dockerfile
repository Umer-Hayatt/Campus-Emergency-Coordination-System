FROM node:20-bookworm-slim

# Install Python 3, pip, and netcat for readiness probing in start.sh
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install bridge npm dependencies
COPY bridge/package*.json ./bridge/
RUN cd bridge && npm install --production

# Copy backend and bridge source files
COPY Backend/ ./Backend/
COPY bridge/ ./bridge/
COPY start.sh ./start.sh

# Ensure start script has executable permissions
RUN chmod +x ./start.sh

# Expose bridge port (defaults to 8080)
EXPOSE 8080

ENV PORT=8080 \
    PYTHON_HOST=127.0.0.1 \
    PYTHON_PORT=5000 \
    ALERTBRIDGE_HOST=127.0.0.1 \
    ALERTBRIDGE_PORT=5000

CMD ["/bin/bash", "./start.sh"]
