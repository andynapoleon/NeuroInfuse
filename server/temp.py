# import torch
# print("PyTorch version:", torch.__version__)
# print("CUDA available:", torch.cuda.is_available())
import os
print("ObjectStitch.pth exists:", os.path.exists("./checkpoints\ObjectStitch.pth"))


# python scripts/inference.py --outdir results --testdir examples --num_samples 1 --sample_steps 10
# python ./model_util.py --outdir results --testdir examples --num_samples 1 --sample_steps 10
# myenv\Scripts\activate
# pip install torch==1.13.1+cu117 torchvision==0.14.1+cu117 -f https://download.pytorch.org/whl/torch_stable.html