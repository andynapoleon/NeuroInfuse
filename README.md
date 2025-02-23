# NeuroInfuse

## Inspiration
Non-creative individuals often struggle to visualize how different elements can come together cohesively. This limits their ability to explore design or architectural ideas. **NeuroInfuse** was created to solve this problem by leveraging AI to seamlessly integrate objects into background images while preserving their structure, making creative design accessible to everyone.

## What it does
**NeuroInfuse** is an AI-powered tool that seamlessly integrates objects into background images while maintaining their original structure. It functions like an automated version of Photoshop, using a **Stable Diffusion** model to blend elements naturally and realistically. Users can input objects and backgrounds, and the system generates a cohesive composition.

## How we built it
NeuroInfuse was built using a combination of modern technologies:

- **Frontend**: Developed with **React** and **TypeScript** for a responsive and intuitive user interface.
- **Backend**: Powered by **FastAPI** to handle communication between the frontend and the AI model.
- **AI Model**: Utilized **PyTorch** and **Stable Diffusion** for image generation and integration.
- **Integration**: The system was designed to ensure smooth interaction between the frontend, backend, and AI components.

Our backend is a based on Objectstitch, utilizing masked foreground images and employing all class and patch tokens from the foreground image as conditional embeddings.