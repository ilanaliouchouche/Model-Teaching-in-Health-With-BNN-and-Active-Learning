import os
import torch
import torch.nn as nn
import torchbnn as bnn
import torchvision.models as models

CHECKPOINT_DIR = "./checkpoints/"
ONNX_PATH = os.path.join(CHECKPOINT_DIR, "best_ckpt.onnx")
CHECKPOINT_PATH = max(
    [os.path.join(CHECKPOINT_DIR, f) for f in os.listdir(CHECKPOINT_DIR) if f.endswith(".pth")],
    key=os.path.getctime,
)

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

def load_model():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    bayes_layers_config = [
        {"out_features": 512, "prior_mu": 0, "prior_sigma": 0.1},
        {"out_features": 256, "prior_mu": 0, "prior_sigma": 0.1},
        {"out_features": 128, "prior_mu": 0, "prior_sigma": 0.1},
        {"out_features": 2, "prior_mu": 0, "prior_sigma": 0.1}
    ]
    model = BNN_ResNet(bayes_layers_config).to(device)
    model.load_state_dict(torch.load(CHECKPOINT_PATH, map_location=device))
    model.eval()
    return model

def convert_to_onnx(model):
    dummy_input = torch.randn(1, 3, 224, 224)
    torch.onnx.export(
        model, 
        dummy_input, 
        ONNX_PATH, 
        export_params=True,  
        opset_version=11,  
        do_constant_folding=True,  
        input_names=['input'], 
        output_names=['output'], 
        dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
    )
    print(f"Model saved at {ONNX_PATH}")

if __name__ == "__main__":
    model = load_model()
    convert_to_onnx(model)