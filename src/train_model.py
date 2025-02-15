import os
import time
import torch
import torch.nn as nn
import torch.optim as optim
import torchbnn as bnn
import torchvision.transforms as transforms
import torchvision.models as models
import numpy as np
from torchvision.datasets import ImageFolder
from torch.utils.data import DataLoader
from torch.utils.tensorboard import SummaryWriter
from tqdm import tqdm
from sklearn.metrics import f1_score, matthews_corrcoef, precision_score, recall_score

class BNN_ResNet(nn.Module):
    def __init__(self, bayes_layers_config):
        super(BNN_ResNet, self).__init__()
        self.resnet = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
        for param in self.resnet.parameters():
            param.requires_grad = False
        
        layers = []
        in_features = 512
        for layer_config in bayes_layers_config:
            layers.append(bnn.BayesLinear(
                prior_mu=layer_config["prior_mu"],
                prior_sigma=layer_config["prior_sigma"],
                in_features=in_features,
                out_features=layer_config["out_features"]
            ))
            layers.append(nn.ReLU())
            in_features = layer_config["out_features"]
        
        layers.pop()
        self.resnet.fc = nn.Sequential(*layers)

    def forward(self, x):
        return self.resnet(x)


def train_bnn(
    num_epochs=10,
    batch_size=32,
    learning_rate=0.001,
    kl_weight=0.01,
    mc_samples=10,
    bayes_layers_config=[
        {"out_features": 256, "prior_mu": 0, "prior_sigma": 0.1},
        {"out_features": 128, "prior_mu": 0, "prior_sigma": 0.1},
        {"out_features": 2, "prior_mu": 0, "prior_sigma": 0.1}
    ],
    log_tensorboard=False
):
    DATA_DIR = "./data/"
    CHECKPOINT_DIR = "./checkpoints/"
    RUNS_DIR = "./runs/"
    os.makedirs(CHECKPOINT_DIR, exist_ok=True)
    os.makedirs(RUNS_DIR, exist_ok=True)

    timestamp = time.strftime("%H_%M_%S_%d_%m_%y")
    log_dir = os.path.join(RUNS_DIR, timestamp)
    writer = SummaryWriter(log_dir=log_dir) if log_tensorboard else None

    transform = transforms.Compose([
        transforms.Grayscale(num_output_channels=3),
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    train_dataset = ImageFolder(root=os.path.join(DATA_DIR, "train"), transform=transform)
    val_dataset = ImageFolder(root=os.path.join(DATA_DIR, "validation"), transform=transform)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=2, pin_memory=True)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = BNN_ResNet(bayes_layers_config).to(device)

    ce_loss = nn.CrossEntropyLoss()
    kl_loss = bnn.BKLLoss(reduction='mean', last_layer_only=False)

    optimizer = optim.Adam(model.parameters(), lr=learning_rate)

    best_val_loss = float("inf")

    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0
        for images, labels in tqdm(train_loader, desc=f"Epoch {epoch+1}/{num_epochs}"):
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            
            ce = ce_loss(outputs, labels)
            kl = kl_loss(model)
            loss = ce + kl_weight * kl

            loss.backward()
            optimizer.step()

            running_loss += loss.item()

        avg_train_loss = running_loss / len(train_loader)

        if log_tensorboard:
            writer.add_scalar("Loss/Train_CE", ce.item(), epoch + 1)
            writer.add_scalar("Loss/Train_KL", kl.item(), epoch + 1)

        model.eval()
        val_loss = 0.0
        correct = 0
        total = 0
        all_preds = []
        all_labels = []
        all_std = []
        most_uncertain_images = []

        with torch.inference_mode():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)

                mc_predictions = np.array([torch.softmax(model(images), dim=1).cpu().numpy() for _ in range(mc_samples)])
                
                mean_pred = mc_predictions.mean(axis=0)
                std_pred = mc_predictions.std(axis=0)
                
                final_pred = np.argmax(mean_pred, axis=1)
                
                ce = ce_loss(torch.tensor(mean_pred, device=device), labels)
                kl = kl_loss(model)
                loss = ce + kl_weight * kl
                val_loss += loss.item()

                total += labels.size(0)
                correct += (final_pred == labels.cpu().numpy()).sum()
                
                all_preds.extend(final_pred)
                all_labels.extend(labels.cpu().numpy())
                all_std.extend(std_pred.max(axis=1))

                if log_tensorboard:
                    for i in range(len(images)):
                        most_uncertain_images.append((images[i].cpu(), std_pred[i].max()))

        avg_val_loss = val_loss / len(val_loader)
        accuracy = 100 * correct / total
        f1 = f1_score(all_labels, all_preds, average='weighted')
        mcc = matthews_corrcoef(all_labels, all_preds)
        precision = precision_score(all_labels, all_preds, average='weighted')
        recall = recall_score(all_labels, all_preds, average='weighted')
        mean_std = np.mean(all_std)

        if log_tensorboard:
            writer.add_scalar("Loss/Validation_CE", ce.item(), epoch + 1)
            writer.add_scalar("Loss/Validation_KL", kl.item(), epoch + 1)
            writer.add_scalar("Accuracy/Validation", accuracy, epoch + 1)
            writer.add_scalar("Metrics/F1_Score", f1, epoch + 1)
            writer.add_scalar("Metrics/MCC", mcc, epoch + 1)
            writer.add_scalar("Metrics/Precision", precision, epoch + 1)
            writer.add_scalar("Metrics/Recall", recall, epoch + 1)
            writer.add_scalar("Metrics/Mean_Uncertainty", mean_std, epoch + 1)

            most_uncertain_images.sort(key=lambda x: x[1], reverse=True)
            for i in range(min(3, len(most_uncertain_images))):
                img, _ = most_uncertain_images[i]
                writer.add_image(f"Uncertain_Samples/Top_{i+1}", img, epoch + 1)

        epoch_checkpoint = os.path.join(CHECKPOINT_DIR, f"ckpt_epoch_{epoch+1}.pth")
        torch.save(model.state_dict(), epoch_checkpoint)

        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            best_checkpoint = os.path.join(CHECKPOINT_DIR, f"ckpt_best_{timestamp}.pth")
            torch.save(model.state_dict(), best_checkpoint)

        print(f"Epoch {epoch+1}: Train Loss = {avg_train_loss:.4f}, Validation Loss = {avg_val_loss:.4f}, Accuracy = {accuracy:.2f}%, F1 = {f1:.4f}, MCC = {mcc:.4f}, Precision = {precision:.4f}, Recall = {recall:.4f}, Mean Uncertainty = {mean_std:.4f}")

    print(f"Best model saved at {best_checkpoint}")
    
    if log_tensorboard:
        writer.close()


if __name__ == "__main__":
    train_bnn(
        num_epochs=60,
        batch_size=128,
        learning_rate=3e-5,
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
