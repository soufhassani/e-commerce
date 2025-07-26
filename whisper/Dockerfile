# Base Python image
FROM python:3.10-slim

# Prevent interactive prompts during package installs
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies (for whisper + ffmpeg)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \
        git \
        curl \
        build-essential \
        python3-dev \
        libffi-dev \
        libsndfile1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose port
EXPOSE 5000

# Start FastAPI with uvicorn
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "5000"]
