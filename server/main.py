from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import io
import random
import base64
import logging
import time 
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_random_image(width=400, height=400):
    # Create a new image with a random background color
    color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
    img = Image.new('RGB', (width, height), color)

    # add buffer for 4 seconds
    # time.sleep(4) 
    
    # Convert PIL image to base64 string
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr = img_byte_arr.getvalue()
    
    return base64.b64encode(img_byte_arr).decode('utf-8')

@app.post("/api/infuse")
async def infuse_images(
    background_image: UploadFile = File(...),
    front_image: UploadFile = File(...),
    transform: str = Form(...),
    batch_count: int = Form(...)
):
    # show background image
    image_size = (512, 512)

    background_image = Image.open(io.BytesIO(await background_image.read()))
    background_image = background_image.resize(image_size)

    # show front image
    front_image = Image.open(io.BytesIO(await front_image.read()))
    front_image = front_image.resize(image_size)

    # convert transform string to json
    transform = json.loads(transform)
    
    transform['x'] += 256
    transform['y'] += 256
    front_size = (image_size[0] * transform['scale'], image_size[1] * transform['scale'])


    # show transform
    logger.info(f"Received request with transform: {transform}")

    logger.info(f"Received request with batch_count: {batch_count}")

    
    try:
        # Generate random results based on batch count
        results = []
        for i in range(batch_count):
            # Generate a random image and convert to base64
            image_base64 = generate_random_image()
            
            results.append({
                "id": f"result-{random.randint(10000, 99999)}",
                "imageUrl": f"data:image/png;base64,{image_base64}"
            })
        
        logger.info(f"Generated {len(results)} results")
        return JSONResponse(content=results)
    
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"}
        )

if __name__ == "__main__":
    # uvicorn main:app --reload

    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)