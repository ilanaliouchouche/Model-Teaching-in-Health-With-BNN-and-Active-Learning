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
imageDatasetBrowser.title = "🗂️ Images Dataset";

const thresholdSlider = slider({
  values: [0.3],
  min: 0.0,
  max: 0.7,
  step: 0.05,
});
thresholdSlider.title = "🎯 Uncertainty Threshold";

const t1 = text(`
  <ol>
    📤 <strong>Upload images, set the uncertainty threshold, and click "Analyze" to filter images with high uncertainty</strong>
  </ol>
`);
t1.title = "🔍 Step 1";

const t2 = text(`
  <ol start="2">
    🏷️ <strong>Select a label for the image and validate your choice</strong>
  </ol>
`);
t2.title = "✅ Step 2";

const labelSelect = select(['Positive', 'Negative'], 'Positive');
labelSelect.title = "";

const firstImageStream = createStream(null);
const imageDisplayComponent = imageDisplay(firstImageStream);
imageDisplayComponent.title = "🖼️ Image Preview";

const chartComponent = genericChart({ preset: 'bar' });
chartComponent.title = "📊 Uncertainty Variance";

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
      uncertaintyMap.set(image.id, uncertainty);
      return {
        ...image,
        id: image.id || `img_${index}`,
        uncertainty,
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

  if (!images.length) {
    console.warn("⚠️ No more images to display.");
    firstImageStream.set(null);
    return;
  }

  const currentImage = images[0];
  const selectedLabel = labelSelect.$value.get();

  console.log(`✅ Image labeled: ${selectedLabel}`);

  try {
    await imageDataset.remove(currentImage.id);
    uncertaintyMap.delete(currentImage.id);
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
  .sidebar(input, t2, labelSelect, validateButton, imageDisplayComponent)
  .use(t1, imageDatasetBrowser, thresholdSlider, analyzeButton, chartComponent);

dash.settings.datasets(imageDataset);

dash.show();