# 🧠 NeuroInfuse 🖼️

![🛏️ Bed demo](<./assets/bed demo.jpg>)

## 💡 Inspiration
Non-creative individuals often struggle to visualize how different elements can come together cohesively. This limits their ability to explore design or architectural ideas. **NeuroInfuse** was created to solve this problem by leveraging AI to seamlessly integrate objects into background images while preserving their structure, making creative design accessible to everyone.

## ⚙️ What it does
**NeuroInfuse** is an AI-powered tool that seamlessly integrates objects into background images while maintaining their original structure. It functions like an automated version of Photoshop, using a **Stable Diffusion** model to blend elements naturally and realistically. Users can input objects and backgrounds, and the system generates a cohesive composition.

▶️ 🛏️ Watch Bed Demo

https://github.com/user-attachments/assets/102b4b08-79c1-47be-9976-39e98e67aff5

▶️ 🐱 Watch Cat Demo

https://github.com/user-attachments/assets/b1ac5dee-37c8-4300-927d-2409d92eb36e

## 🔧 How we built it
NeuroInfuse was built using a combination of modern technologies:

- **🖥️ Frontend**: Developed with **React** and **TypeScript** for a responsive and intuitive user interface.
- **⚙️ Backend**: Powered by **Python FastAPI** to handle communication between the frontend and the AI model.
- **🧠 AI Model**: Utilized **PyTorch** and **Stable Diffusion** for image generation and integration.
- **🔗 Integration**: The system was designed to ensure smooth interaction between the frontend, backend, and AI components.

Our backend is based on [ObjectStitch-Image-Composition](https://github.com/bcmi/ObjectStitch-Image-Composition) utilizing masked foreground images and employing all class and patch tokens from the foreground image as conditional embeddings.

![🛠️ System](<./assets/system.png>)

## 🚀 Get Started

### 1️⃣ Dependencies

- **🐍 Python** 3.9.21
- **📦 pip** 25.0.1

#### 🖥️ Server Setup
```bash
pip install torch==1.13.1+cu117 torchvision==0.14.1+cu117 -f https://download.pytorch.org/whl/torch_stable.html
cd server
pip install -r requirements.txt
cd src/taming-transformers
pip install -e .
```

#### 🏗️ Client Setup
```bash
cd client
npm install
```

### 2️⃣ 📥 Download Models

- Please download the following files to the `checkpoints` folder to create the following file tree:
  ```bash
  checkpoints/
  ├── ObjectStitch.pth
  └── openai-clip-vit-large-patch14
      ├── config.json
      ├── merges.txt
      ├── preprocessor_config.json
      ├── pytorch_model.bin
      ├── tokenizer_config.json
      ├── tokenizer.json
      └── vocab.json
  ```
- **📥 openai-clip-vit-large-patch14 ([Huggingface](https://huggingface.co/BCMIZB/Libcom_pretrained_models/blob/main/openai-clip-vit-large-patch14.zip) | [ModelScope](https://www.modelscope.cn/models/bcmizb/Libcom_pretrained_models/file/view/master/openai-clip-vit-large-patch14.zip))**.
- **📥 ObjectStitch.pth ([Huggingface](https://huggingface.co/BCMIZB/Libcom_pretrained_models/blob/main/ObjectStitch.pth) | [ModelScope](https://www.modelscope.cn/models/bcmizb/Libcom_pretrained_models/file/view/master/ObjectStitch.pth))**.

## ▶️ Run the App

#### 🏗️ Client
```bash
npm run dev
```

#### ⚙️ Server
```bash
python .\scripts\main.py
```
