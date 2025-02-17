import '@marcellejs/core/dist/marcelle.css';
import {
  datasetBrowser,
  dataset,
  dataStore,
  dashboard,
  imageUpload,
  button,
} from '@marcellejs/core';

const input = imageUpload({
  title: "Upload images",
});

const store = dataStore('localStorage');
const imageDataset = dataset('UploadedImages', store);

const $instances = input.$images
  .zip(
    async (thumbnail, img) => ({
      type: 'image',
      thumbnail,
    }),
    input.$thumbnails,
  )
  .awaitPromises();

$instances.subscribe(imageDataset.create);

const imageDatasetBrowser = datasetBrowser(imageDataset);

function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

const analyzeButton = button('Analyze');
analyzeButton.$click.subscribe(async () => {
  console.log("📤 Fetching images from dataset...");
  
  let datasetContent = await imageDataset.find();
  let images = datasetContent.data; 

  console.log("📊 Dataset:", datasetContent);
  console.log("🔢 Image Count:", images.length);

  if (!Array.isArray(images) || images.length === 0) {
    console.warn("⚠️ No images uploaded.");
    return;
  }

  try {
    const formData = new FormData();
    
    images.forEach((image, index) => {
      const mimeType = image.thumbnail.split(';')[0].split(':')[1];
      const blob = base64ToBlob(image.thumbnail, mimeType);
      formData.append("images", blob, `image_${index}.jpg`);
    });

    console.log("📝 FormData Ready:", formData);

    const response = await fetch('http://localhost:8000/active_learning', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    const result = await response.json();
    console.log('Active Learning Result:', result);
  } catch (error) {
    console.error("API request failed:", error);
  }
});

const dash = dashboard({
  title: 'Image Upload Interface',
  author: 'Ilan Aliouchouche',
});

dash.page('Uploaded Images').sidebar(input).use(imageDatasetBrowser, analyzeButton);
dash.settings.datasets(imageDataset);

dash.show();