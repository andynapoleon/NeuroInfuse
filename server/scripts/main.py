from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import io
import random
import base64
import logging
import json

from model_util import *

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React app URL
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
    removed_bg_image: UploadFile = File(...),
    transform: str = Form(...),
    batch_count: int = Form(...),
    steps: int = Form(...)
):
    global start
    start = time.time()
    print("received request", transform)
    seed_everything(100)
    
    # Process background image
    bg_bytes = await background_image.read()
    bg_img = Image.open(io.BytesIO(bg_bytes))
    bg_img = bg_img.resize(img_size)

    # Process front image
    front_bytes = await front_image.read()
    front_img = Image.open(io.BytesIO(front_bytes))
    front_img = front_img.resize(img_size)
    
    sample_steps = steps

    # Convert transform string to json
    transform = json.loads(transform)

    rotated_front_img = front_img.rotate(-transform['rotation'], expand=True)

    transform['x'] = int(transform['x'] / 2 + 256)
    transform['y'] = int(transform['y'] / 2 + 256)
    bbox_size = (int(rotated_front_img.size[0] * transform['scale'] / 2),
                 int(rotated_front_img.size[1] * transform['scale'] / 2))
    
    
    rotated_front_img = rotated_front_img.resize(img_size)

    # Calculate bounding box (x1, y1, x2, y2) 
    bbox = [transform['x'] - int(bbox_size[0] / 2),
            transform['y'] - int(bbox_size[1] / 2), 
            transform['x'] + int(bbox_size[0] / 2), 
            transform['y'] + int(bbox_size[1] / 2)]
    
    # constrain bbox 
    bbox[0] = max(0, bbox[0])
    bbox[1] = max(0, bbox[1])
    bbox[2] = min(img_size[0], bbox[2])
    bbox[3] = min(img_size[1], bbox[3])


    # logger.info(f"processed transform: {transform}")
    # logger.info(f"Received request with batch_count: {batch_count}")

    # draw bbox on bg_img using open cv2
    # Convert PIL image to OpenCV format
    # bg_img_cv = cv2.cvtColor(np.array(bg_img), cv2.COLOR_RGB2BGR)

    # # Draw bounding box on the background image
    # cv2.rectangle(bg_img_cv, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (255, 0, 0), 2)

    # # Convert OpenCV image back to PIL format
    # bg_img = Image.fromarray(cv2.cvtColor(bg_img_cv, cv2.COLOR_BGR2RGB))

    try:
        # Process removed background image
        removed_bg_bytes = await removed_bg_image.read()
        removed_bg_img = Image.open(io.BytesIO(removed_bg_bytes))
        # rotate 
        rotated_removed_bg_img = removed_bg_img.rotate(-transform['rotation'], expand=True).resize(img_size)

        # Create a mask from the removed background image and apply it to the front image
        mask = np.array(rotated_removed_bg_img.convert("L"))
        mask = np.where(mask > 0, 255, 0).astype(np.uint8)
        mask = Image.fromarray(mask)
        
        # Generate random results based on batch count
        # for i in range(batch_count):
        #     image_base64 = generate_random_image()  # Ensure this returns a base64-encoded PNG image
        #     results.append({
        #         "id": f"result-{random.randint(10000, 99999)}",
        #         "imageUrl": f"data:image/png;base64,{image_base64}"
        #     })

        # Generate results using the model
        results = run_model(bg_img,
                             rotated_front_img,
                               mask,
                                 batch_count, bbox, sample_steps, device)
        
        # logger.info(f"Generated {len(results)} results")
        return JSONResponse(content=results)
    
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error"}
        )

def run_model(bg_img, front_img, fg_mask, num_samples, bbox, sample_steps, device):
    results = []
    start_code = torch.randn([num_samples]+shape, device=device)

    batch = generate_image_batch(bg_img, front_img, bbox, fg_mask)
    test_model_kwargs, c, uc = prepare_input(batch, model, shape, device, num_samples)
    
    with torch.inference_mode(), torch.cuda.amp.autocast():
        samples_ddim, _ = sampler.sample(S=sample_steps,
                                        conditioning=c,
                                        batch_size=num_samples,
                                        shape=shape,
                                        verbose=False,
                                        eta=0.0,
                                        x_T=start_code,
                                        unconditional_guidance_scale=guidance_scale,
                                        unconditional_conditioning=uc,
                                        test_model_kwargs=test_model_kwargs)
    x_samples_ddim = model.decode_first_stage(samples_ddim.half()[:,:4]).cpu().float()
    print('inference time: {:.1f}s'.format(time.time() - start))


    comp_img = tensor2numpy(x_samples_ddim, image_size=img_size)

    
    for i in range(comp_img.shape[0]):

        # Convert comp_img[i] to a PIL image
        image = Image.fromarray(comp_img[i])
        
        # Convert the PIL image to a base64 string
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

        results.append({
            "id": f"result-{random.randint(10000, 99999)}",
            "imageUrl": f"data:image/png;base64,{img_str}"
        })

        # if i > 0:
        #     res_path = os.path.join("results", "test" + f'_sample{i}.png')
        # else:
        #     res_path = os.path.join("results", "test" + '.jpg')
        # save_image(comp_img[i], res_path)
        # print('save result to {}'.format(res_path))

    return results

if __name__ == "__main__":
    # uvicorn main:app --reload
    weight_path = "./checkpoints/ObjectStitch.pth"
    config      = OmegaConf.load("./configs/v1.yaml")
    clip_path   = "./checkpoints/openai-clip-vit-large-patch14"
    config.model.params.cond_stage_config.params.version = clip_path
    model = load_model_from_config(config, weight_path)
    device = torch.device(f'cuda:0')
    model = model.to(device).half()
    model = model.to(memory_format=torch.channels_last)  # Better memory access patterns

    sampler = DDIMSampler(model)
    guidance_scale = 5
    img_size    = (512, 512)
    shape = [4, img_size[1] // 8, img_size[0] // 8]


    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)