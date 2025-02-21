import os
import torch
import csv
from tqdm.auto import tqdm
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
import torchvision.transforms as transforms
from torchvision.datasets import ImageFolder
from torch.utils.data import DataLoader


def test_model(model, device, path="./data/test/", batch_size=128):
    transform = transforms.Compose([
        transforms.Grayscale(num_output_channels=3),
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    test_dataset = ImageFolder(root=path, transform=transform)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=2, pin_memory=True)

    model.to(device)
    model.eval()

    all_labels = []
    all_preds = []
    all_var = []

    with torch.inference_mode():
        for images, labels in tqdm(test_loader, desc="Testing"):
            images, labels = images.to(device), labels.to(device)

            mc_predictions = torch.stack([torch.softmax(model(images), dim=1) for _ in range(10)], dim=0)
            
            mean_pred = mc_predictions.mean(dim=0)
            var_pred = mc_predictions.var(dim=0)

            final_pred = mean_pred.argmax(dim=1)

            all_labels.extend(labels.cpu().tolist())
            all_preds.extend(final_pred.cpu().tolist())
            all_var.extend(var_pred.max(dim=1)[0].cpu().tolist())

    accuracy = accuracy_score(all_labels, all_preds)
    f1 = f1_score(all_labels, all_preds, average='weighted')
    precision = precision_score(all_labels, all_preds, average='weighted')
    recall = recall_score(all_labels, all_preds, average='weighted')
    mean_variance = sum(all_var) / len(all_var) if all_var else 0

    return {
        "accuracy": accuracy,
        "f1": f1,
        "precision": precision,
        "recall": recall,
        "test_size": len(all_labels),
        "n_positives": sum(1 for x in all_labels if x == 1),
        "n_negatives": sum(1 for x in all_labels if x == 0),
        "variance": mean_variance
    }

def load_results(results, csv_path="./data/results.csv"):
    file_exists = os.path.isfile(csv_path)
    
    with open(csv_path, mode="a", newline="") as file:
        writer = csv.writer(file)
        
        if not file_exists:
            writer.writerow(["accuracy", "f1", "precision", "recall", "test_size", "n_positives", "n_negatives", "variance"])

        writer.writerow([
            results["accuracy"],
            results["f1"],
            results["precision"],
            results["recall"],
            results["test_size"],
            results["n_positives"],
            results["n_negatives"],
            results["variance"]
        ])


if __name__ == "__main__":
    from ml.train_model import BNN_ResNet

    model = BNN_ResNet([
        {"out_features": 512, "prior_mu": 0, "prior_sigma": 0.1},
        {"out_features": 256, "prior_mu": 0, "prior_sigma": 0.1},
        {"out_features": 128, "prior_mu": 0, "prior_sigma": 0.1},
        {"out_features": 2, "prior_mu": 0, "prior_sigma": 0.1}
    ])

    checkpoint_path = "checkpoints/ckpt_best.pth"

    if os.path.exists(checkpoint_path):
        model.load_state_dict(torch.load(checkpoint_path, map_location=torch.device("cpu")))
    else:
        print("❌ No checkpoint found. Please train the model first.")
        exit(1)

    device = torch.device("cuda" if torch.cuda.is_available() else "mps"
                          if torch.backends.mps.is_available() else "cpu")
    model.to(device)
    model.eval()

    results = test_model(model, device, path="./data/test/", batch_size=128)
    
    load_results(results, csv_path="./data/results.csv")

    print(f"Accuracy: {results['accuracy']:.4f}")
    print(f"F1 Score: {results['f1']:.4f}")
    print(f"Precision: {results['precision']:.4f}")
    print(f"Recall: {results['recall']:.4f}")
    print(f"Test Size: {results['test_size']}")
    print(f"Number of Positives: {results['n_positives']}")
    print(f"Number of Negatives: {results['n_negatives']}")
    print(f"Mean Variance: {results['variance']:.4f}")
