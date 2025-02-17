from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import torch
from io import BytesIO
from PIL import Image
from ml.train_model import transform_image, BNN_ResNet

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = BNN_ResNet([
    {"out_features": 512, "prior_mu": 0, "prior_sigma": 0.1},
    {"out_features": 256, "prior_mu": 0, "prior_sigma": 0.1},
    {"out_features": 128, "prior_mu": 0, "prior_sigma": 0.1},
    {"out_features": 2, "prior_mu": 0, "prior_sigma": 0.1}
])

model.load_state_dict(torch.load('checkpoints/ckpt_best.pth', map_location=torch.device('cpu')))
model.eval()

MC_SAMPLES = 10

async def load_and_transform_image(uploaded_file: UploadFile):
    image = Image.open(BytesIO(await uploaded_file.read())).convert("RGB")
    return transform_image(image).unsqueeze(0)

@app.post("/active_learning")
async def active_learning(images: List[UploadFile] = File(...)):
    if not images:
        return {"error": "No images received."}

    transformed_images = torch.cat([await load_and_transform_image(image) for image in images])

    with torch.inference_mode():
        model.train()
        mc_outputs = torch.stack([torch.softmax(model(transformed_images), dim=1) for _ in range(MC_SAMPLES)], dim=0)

    probabilities_class_1 = mc_outputs[:, :, 1]  # (MC_SAMPLES, batch_size)

    mean_probabilities = probabilities_class_1.mean(dim=0).tolist()
    uncertainties = probabilities_class_1.std(dim=0).tolist()

    return {
        "predictions": [
            {"probability_class_1": prob, "uncertainty": var}
            for prob, var in zip(mean_probabilities, uncertainties)
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)