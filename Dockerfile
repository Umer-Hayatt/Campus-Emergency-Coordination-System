FROM node:20-bookworm-slim

# Install Python 3, pip, and netcat for readiness probing in start.sh
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces non-root user requirement (UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PORT=7860 \
    PYTHON_HOST=127.0.0.1 \
    PYTHON_PORT=5000 \
    ALERTBRIDGE_HOST=127.0.0.1 \
    ALERTBRIDGE_PORT=5000 \
    ALLOWED_ORIGIN=https://alert-bridge-sage.vercel.app

WORKDIR $HOME/app

# Install bridge npm dependencies
COPY --chown=user:user bridge/package*.json ./bridge/
RUN cd bridge && npm install --production

# Copy backend and bridge source files
COPY --chown=user:user Backend/ ./Backend/
COPY --chown=user:user bridge/ ./bridge/
COPY --chown=user:user start.sh ./start.sh

# Ensure start script has executable permissions
RUN chmod +x ./start.sh

# Expose bridge port (7860 for Hugging Face Spaces / default)
EXPOSE 7860

CMD ["/bin/bash", "./start.sh"]
