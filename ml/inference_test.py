import onnxruntime as ort
import torch
import torchvision.transforms as transforms
from PIL import Image

ONNX_PATH = "./checkpoints/best_ckpt.onnx"
session = ort.InferenceSession(ONNX_PATH, providers=["CPUExecutionProvider"])

transform = transforms.Compose([
    transforms.Grayscale(num_output_channels=3),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

image_path = "test_image.png"
image = Image.open(image_path).convert("RGB")
input_tensor = transform(image).unsqueeze(0).numpy()

input_name = session.get_inputs()[0].name
output_name = session.get_outputs()[0].name

for _ in range(5):  # We test if we really have a BNN
    output = session.run([output_name], {input_name: input_tensor})
    output_tensor = torch.tensor(output[0])
    probs = torch.softmax(output_tensor, dim=1)
    prediction = torch.argmax(probs, dim=1).item()
    print(f"Prediction: {prediction}, Probability: {probs}")