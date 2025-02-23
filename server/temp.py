# import torch
# print("PyTorch version:", torch.__version__)
# print("CUDA available:", torch.cuda.is_available())
import os
print("ObjectStitch.pth exists:", os.path.exists("./checkpoints\ObjectStitch.pth"))


# python scripts/inference.py --outdir results --testdir examples --num_samples 1 --sample_steps 10
# python ./model_util.py --outdir results --testdir examples --num_samples 1 --sample_steps 10
# myenv\Scripts\activate
# pip install torch==1.13.1+cu117 torchvision==0.14.1+cu117 -f https://download.pytorch.org/whl/archives.html


# FROM pytorch/pytorch:1.13.0-cuda11.6-cudnn8-runtime

# WORKDIR /app

# RUN pip install torch==1.13.1+cu117 torchvision==0.14.1+cu117 -f https://download.pytorch.org/whl/torch_stable.html

# # Install dependencies
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt

# COPY src/taming-transformers /app/src/taming-transformers
# WORKDIR /app/src/taming-transformers
# RUN pip install -e .
# WORKDIR /app

# # Copy model checkpoints and configs
# COPY ./checkpoints /app/checkpoints
# COPY ./configs /app/configs

# # Copy FastAPI code
# COPY ./scripts/main.py /app/main.py
# COPY ./scripts/model_util.py /app/model_util.py

# # Expose port for FastAPI
# EXPOSE 8000

# # Run the FastAPI server
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]