FROM pytorch/pytorch:1.13.0-cuda11.6-cudnn8-runtime

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install torch==1.13.1+cu117 torchvision==0.14.1+cu117 -f https://download.pytorch.org/whl/torch_stable.html
RUN pip install --no-cache-dir -r requirements.txt

COPY src/taming-transformers /app/src/taming-transformers
WORKDIR /app/src/taming-transformers
RUN pip install -e .
WORKDIR /app

# Copy model checkpoints and configs
COPY ./checkpoints /app/checkpoints
COPY ./configs /app/configs

# Copy FastAPI code
COPY ./scripts/main.py /app/main.py
COPY ./scripts/model_util.py /app/model_util.py

# Expose port for FastAPI
EXPOSE 8000

# Run the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]