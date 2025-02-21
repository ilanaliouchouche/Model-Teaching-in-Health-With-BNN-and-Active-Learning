from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks
import shutil
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import torch
import pandas as pd
import time
from io import BytesIO
from PIL import Image
from ml.train_model import transform_image, BNN_ResNet, train_bnn
from ml.test_model import test_model, load_results
import os
import subprocess


SAVE_PATH = "data/new_data"
CSV_PATH = "data/results.csv"

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

device = torch.device("cuda" if torch.cuda.is_available() else "mps"
                        if torch.backends.mps.is_available() else "cpu")
model.load_state_dict(torch.load('checkpoints/ckpt_best.pth', map_location=torch.device('cpu')))
model.to(device)
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
    transformed_images = transformed_images.to(device)

    with torch.inference_mode():
        model.train()
        mc_outputs = torch.stack([torch.softmax(model(transformed_images), dim=1) for _ in range(MC_SAMPLES)], dim=0)

    probabilities_class_1 = mc_outputs[:, :, 1]  # (MC_SAMPLES, batch_size)

    mean_probabilities = probabilities_class_1.mean(dim=0).tolist()
    uncertainties = probabilities_class_1.var(dim=0).tolist()

    return {
        "predictions": [
            {"probability_class_1": prob, "uncertainty": var}
            for prob, var in zip(mean_probabilities, uncertainties)
        ]
    }

@app.post("/save_image")
async def save_image(file: UploadFile = File(...), label: str = Form(...)):

    folder_path = os.path.join(SAVE_PATH, label)
    os.makedirs(folder_path, exist_ok=True)
    file_path = os.path.join(folder_path, file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    return {"message": f"Image saved in {file_path}"}

@app.get("/get_results")
async def get_results():
    df = pd.read_csv(CSV_PATH)
    if df.empty:
        return {"error": "No results available."}
    results = {
        "accuracy": df["accuracy"].tolist(),
        "f1": df["f1"].tolist(),
        "precision": df["precision"].tolist(),
        "recall": df["recall"].tolist(),
        "variance": df["variance"].tolist(),
        "test_size": int(df["test_size"].iloc[-1]),
        "n_positives": int(df["n_positives"].iloc[-1]),
        "n_negatives": int(df["n_negatives"].iloc[-1]),
    }
    return results

@app.get("/get_n_new_data")
async def get_n_new_data():
    pos_dir = os.path.join(SAVE_PATH, "1")
    neg_dir = os.path.join(SAVE_PATH, "0")

    n_positives = len(os.listdir(pos_dir)) if os.path.exists(pos_dir) else 0
    n_negatives = len(os.listdir(neg_dir)) if os.path.exists(neg_dir) else 0

    return {"n_positives": n_positives, "n_negatives": n_negatives}

@app.post("/ask_training")
async def ask_training(background_tasks: BackgroundTasks):
    train_path = "data/train"
    new_data_path = "data/new_data"

    for label in ["0", "1"]:
        new_data_label_path = os.path.join(new_data_path, label)
        train_label_path = os.path.join(train_path, label)

        os.makedirs(train_label_path, exist_ok=True)

        if os.path.exists(new_data_label_path):
            for file in os.listdir(new_data_label_path):
                src_file = os.path.join(new_data_label_path, file)
                dst_file = os.path.join(train_label_path, file)
                shutil.move(src_file, dst_file)

    def train_and_evaluate():
        subprocess.Popen(["tensorboard", "--logdir=runs", "--port=6006"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        train_bnn(
            num_epochs=60,
            batch_size=128,
            learning_rate=3e-4,
            kl_weight=0.05,
            mc_samples=30,
            log_tensorboard=True,
            bayes_layers_config=[
                {"out_features": 512, "prior_mu": 0, "prior_sigma": 0.1},
                {"out_features": 256, "prior_mu": 0, "prior_sigma": 0.1},
                {"out_features": 128, "prior_mu": 0, "prior_sigma": 0.1},
                {"out_features": 2, "prior_mu": 0, "prior_sigma": 0.1}
            ]
        )

        time.sleep(5)

        checkpoint_path = "./checkpoints/ckpt_best_tmp.pth"
        if os.path.exists(checkpoint_path):
            model_bis = BNN_ResNet([
                {"out_features": 512, "prior_mu": 0, "prior_sigma": 0.1},
                {"out_features": 256, "prior_mu": 0, "prior_sigma": 0.1},
                {"out_features": 128, "prior_mu": 0, "prior_sigma": 0.1},
                {"out_features": 2, "prior_mu": 0, "prior_sigma": 0.1}
            ])
            model_bis.load_state_dict(torch.load(checkpoint_path, map_location=device))
            model_bis.to(device)

            results = test_model(model_bis, device, path="./data/test/", batch_size=128)
            load_results(results, csv_path="./data/results.csv")


    background_tasks.add_task(train_and_evaluate)

    return {"message": "Training started in background. TensorBoard running on port 6006"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
