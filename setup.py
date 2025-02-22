from setuptools import setup, find_packages

setup(
    name='Model-Teaching-in-Health-With-BNN-and-Active-Learning',
    version='0.1',
    packages=find_packages(),
    include_package_data=True,
    author='Ilan Aliouchouche',
    install_requires=[
        'python-multipart',
        'numpy',
        'pandas',
        'matplotlib',
        'tqdm',
        'tensorboard',
        'seaborn',
        'torch',
        'medmnist',
        'torchbnn',
        'onnx',
        'onnxruntime',
        'uvicorn',
        'fastapi'
    ],
    python_requires='>=3.11',
)
