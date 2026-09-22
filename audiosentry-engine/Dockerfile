# Builder Stage
FROM python:3.11 as builder

WORKDIR /build

# Copy and install dependencies first to cache the layer
COPY requirements.txt .
# Install with CPU wheels to drastically reduce image size (4GB -> ~1.5GB)
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt fastapi uvicorn python-multipart

# Runner Stage
FROM python:3.11-slim as runner

# Create a dedicated non-root user for security
RUN useradd -m -r appuser && \
    mkdir /app && \
    chown -R appuser /app

WORKDIR /app

# Copy compiled dependencies from the builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy app code and model weights
COPY . .

# Ensure correct permissions
RUN chown -R appuser:appuser /app

# Transition execution context to non-root user
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
