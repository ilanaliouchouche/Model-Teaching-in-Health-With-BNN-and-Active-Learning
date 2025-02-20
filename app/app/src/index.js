import '@marcellejs/core/dist/marcelle.css';
import {
  datasetBrowser,
  dataset,
  dataStore,
  dashboard,
  imageUpload,
  button,
  slider,
  createStream,
  imageDisplay,
  select,
  genericChart,
  text,
} from '@marcellejs/core';

const input = imageUpload({
  title: "📤 Upload your images"
});
input.title = "";

const store = dataStore('memory');
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
imageDatasetBrowser.title = "🗂️ Images Dataset";

const thresholdSlider = slider({
  values: [0.1],
  min: 0.0,
  max: 0.5,
  step: 0.05,
});
thresholdSlider.title = "🎯 Uncertainty Threshold";

const t1 = text(`
  <div style="text-align: center; padding: 10px; font-size: 16px; font-weight: bold; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">
    📤 Upload images, set the uncertainty threshold, and click "Analyze" to filter images with high uncertainty
  </div>
`);
t1.title = " 1️⃣ Step 1";

const t2 = text(`
  <div style="text-align: center; padding: 10px; font-size: 16px; font-weight: bold; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">
    🏷️ Select a label for the image and validate your choice
  </div>
`);
t2.title = "2️⃣ Step 2";

const probabilityVarianceText = text(`
  <div style="text-align: center; padding: 10px; font-size: 16px; font-weight: bold; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">
    🔢 Probability: <span style="color: #007bff; font-size: 18px;" id="probability-value">-</span><br>
    📊 Variance: <span style="color: #dc3545; font-size: 18px;" id="variance-value">-</span>
  </div>
`);
probabilityVarianceText.title = "📈 Prediction Details";

const labelSelect = select(['Positive', 'Negative'], 'Positive');
labelSelect.title = "";

const firstImageStream = createStream(null);
const imageDisplayComponent = imageDisplay(firstImageStream);
imageDisplayComponent.title = "🖼️ Image Preview";

const chartComponent = genericChart({ preset: 'bar' });
chartComponent.title = "📊 Uncertainty/Variance";
chartComponent.options = {
  scales: {
    x: {
      ticks: {
        display: false,
      },
    },
    y: {
      title: {
        display: false,
      },
    },
  },
  animation: {
    duration: 2000,
    easing: "easeOutBounce",
  },
  plugins: {
    legend: {
      display: false,
    },
  },
};

const probabilityMap = new Map();
const uncertaintyMap = new Map();
const chartData = createStream([]);

chartComponent.addSeries(chartData, "Variance", { backgroundColor: 'blue' });

async function createChartDataset() {
  const datasetContent = await imageDataset.find({ query: {} }).catch(() => null);
  const images = datasetContent ? datasetContent.data : [];

  if (!images.length) {
    chartData.set([]);
    console.log("📉 No data for chart.");
    return;
  }

  const updatedData = images
    .filter(img => uncertaintyMap.has(img.id))
    .map(img => ({
      x: String(img.id),
      y: uncertaintyMap.get(img.id) || 0,
    }));

  console.log("📊 Updating chart with data:", updatedData);
  chartData.set(updatedData);
}

function updateProbabilityVariance(imageId) {
  let probability = probabilityMap.get(imageId) || 0;
  const variance = uncertaintyMap.get(imageId) || 0;
  probability = probability > 0.5 ? probability : 1 - probability;
  document.getElementById("probability-value").textContent = probability.toFixed(2);
  document.getElementById("variance-value").textContent = variance.toFixed(2);
}

function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

async function base64ToImageData(base64) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, img.width, img.height));
    };
    img.onerror = (err) => reject(err);
  });
}

const analyzeButton = button('🔍 Analyze')
analyzeButton.title = "";
analyzeButton.$click.subscribe(async () => {
  console.log("📤 Fetching images from dataset...");
  let images = await imageDataset.items().toArray().catch(() => []);

  if (!images.length) {
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

    const response = await fetch('http://localhost:8000/active_learning', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    const result = await response.json();

    const threshold = thresholdSlider.$values.get()[0];
    console.log(`⚙️ Filtering images with uncertainty > ${threshold}`);

    const filteredImages = images.map((image, index) => {
      const uncertainty = result.predictions[index]?.uncertainty || 0;
      const probability = result.predictions[index]?.probability_class_1 || 0;
      uncertaintyMap.set(image.id, uncertainty);
      probabilityMap.set(image.id, probability);
      return {
        ...image,
        id: image.id || `img_${index}`,
        uncertainty,
        probability,
      };
    });

    const imagesToRemove = filteredImages.filter(img => img.uncertainty <= threshold);
    await Promise.all(imagesToRemove.map(img => imageDataset.remove(img.id)));

    const remainingImages = filteredImages.filter(img => img.uncertainty > threshold);
    console.log(`✅ ${remainingImages.length} images retained after filtering`);

    createChartDataset();

    if (remainingImages.length > 0) {
      console.log("🖼️ Converting first image to ImageData:", remainingImages[0].thumbnail);
      const imageData = await base64ToImageData(remainingImages[0].thumbnail);
      firstImageStream.set(imageData);
      updateProbabilityVariance(remainingImages[0].id);
    } else {
      firstImageStream.set(null);
    }
  } catch (error) {
    console.error("API request failed:", error);
  }
});

const validateButton = button('✅ Validate');
validateButton.title = "";
validateButton.$click.subscribe(async () => {
  let datasetContent = await imageDataset.find({ query: {} }).catch(() => null);
  let images = datasetContent ? datasetContent.data : [];
  console.log(images);

  if (!images.length) {
    console.warn("⚠️ No more images to display.");
    firstImageStream.set(null);
    return;
  }

  const currentImage = images[0];
  const selectedLabel = labelSelect.$value.get();
  const labelFolder = selectedLabel === "Positive" ? "1" : "0";

  console.log(images[0]);

  console.log(`✅ Image labeled: ${selectedLabel}`);


  try {
    const blob = base64ToBlob(currentImage.thumbnail, "image/png");
    const formData = new FormData();
    formData.append("file", blob, `image_${Date.now()}.png`);
    formData.append("label", labelFolder);
  
    const response = await fetch("http://localhost:8000/save_image", {
      method: "POST",
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error(`Erreur lors de l'envoi de l'image: ${response.statusText}`);
    }
    console.log(`📤 Image envoyée avec succès vers /data/new_data/${labelFolder}/`);
  } catch (error) {
    console.warn(`⚠️ Error processing image: ${error.message}`);
  }

  try {
    await imageDataset.remove(currentImage.id);
    uncertaintyMap.delete(currentImage.id);
    probabilityMap.delete(currentImage.id);
    console.log(`🗑️ Image removed: ${currentImage.id}`);
  } catch (error) {
    console.warn(`⚠️ Error removing image: ${error.message}`);
  }

  const updatedChartData = chartData.get()
    .filter(d => d.x !== currentImage.id);

  chartData.set(updatedChartData);

  datasetContent = await imageDataset.find({ query: {} }).catch(() => null);
  images = datasetContent ? datasetContent.data : [];

  if (images.length) {
    console.log("🖼️ Converting next image to ImageData:", images[0].thumbnail);
    const imageData = await base64ToImageData(images[0].thumbnail);
    firstImageStream.set(imageData);
    updateProbabilityVariance(images[0].id);
  } else {
    console.warn("⚠️ No more images to display.");
    firstImageStream.set(null);
  }
});

const dash = dashboard({
  title: '⚕️ Easy Active Learning',
  author: 'Ilan Aliouchouche',
});

dash.page('👩‍🏫 Machine Teaching')
  .sidebar(input, t2, labelSelect, validateButton, probabilityVarianceText, imageDisplayComponent)
  .use(t1, imageDatasetBrowser, thresholdSlider, analyzeButton, chartComponent);

dash.settings.datasets(imageDataset);

dash.show();