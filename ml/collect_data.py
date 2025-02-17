import os
from medmnist import PneumoniaMNIST
from PIL import Image

DATA_DIR = "./data/"
os.makedirs(DATA_DIR, exist_ok=True)

for split in ["train", "test", "validation"]:
    for label in ["0", "1"]:  # 0 = No Pneumonia, 1 = Pneumonia
        os.makedirs(os.path.join(DATA_DIR, split, label), exist_ok=True)

def save_images(dataset, split):
    split_dir = os.path.join(DATA_DIR, split)
    for idx, (image, label) in enumerate(zip(dataset.imgs, dataset.labels)):
        label_dir = os.path.join(split_dir, str(label[0]))  # 0 -> sain, 1 -> pneumonia
        img = Image.fromarray(image.squeeze(), mode="L")
        img.save(os.path.join(label_dir, f"{idx}.png"))

train_dataset = PneumoniaMNIST(split='train', download=True)
val_dataset = PneumoniaMNIST(split='val', download=True)
test_dataset = PneumoniaMNIST(split='test', download=True)

save_images(train_dataset, "train")
save_images(val_dataset, "validation")
save_images(test_dataset, "test")
