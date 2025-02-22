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

const uncertaintyExplanationText = text(`
  <div style="text-align: center; padding: 10px; font-size: 16px; font-weight: bold; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">
    🤖 The model makes multiple predictions with random variations.<br>
    <strong>Uncertainty (Variance) measures how much these predictions differ</strong><br>
    <span style="color: #dc3545;">higher uncertainty means the model is less confident.</span>
  </div>
`);
uncertaintyExplanationText.title = "🔍 Understanding Uncertainty";

const probabilityVarianceText = text(`
  <div style="text-align: center; padding: 10px; font-size: 16px; font-weight: bold; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">
    🎯 Prediction: <span style="color: #adb5bd; font-size: 18px;" id="prediction">-</span><br>
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

chartComponent.addSeries(chartData, "Variance");

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
  const prediction = probability > 0.5 ? "Positive" : "Negative";
  probability = probability > 0.5 ? probability : 1 - probability;
  document.getElementById("prediction").textContent = prediction;
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

//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

const reportInfoText = text(`
  <div style="text-align: center; padding: 10px; font-size: 16px; font-weight: bold; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">
    📊 <strong>Model Performance Dashboard</strong><br><br>
    These visualizations helps assess how well the model is improving over time.<br><br>
    🔍 <strong>Key Metrics Explained:</strong><br>
    - <strong>Accuracy:</strong> Measures how many total images were correctly classified.<br>
    - <strong>Precision:</strong> Out of all predicted pneumonia cases, how many were actually pneumonia.<br>
    - <strong>Recall:</strong> Out of all actual pneumonia cases, how many were correctly detected.<br><br>
    📑 (2min) You can check out
    <a href="https://polukhin.tech/2022/11/26/classification-metrics-visual-explanations" target="_blank" style="color: #007bff; text-decoration: none;">
      this explanation</a>.
  </div>
`);
reportInfoText.title = "ℹ️ Model Performance Overview";

const metricsInstructions = text(`
  <div style="text-align: center; padding: 10px; font-size: 16px; font-weight: bold; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">
    <strong>🏷️ Select a model version to display the respective metrics</strong>
  </div>
`);
metricsInstructions.title = "";

const classDistributionData = createStream([]);
const accuracyData = createStream([]);
const varianceData = createStream([]);

const classDistributionChart = genericChart({ preset: 'bar' });
classDistributionChart.title = "🔢 Test set Class Distribution";
classDistributionChart.options = {
  scales: {
    x: {
      title: { display: true, text: "Class" },
      ticks: { autoSkip: false },
    },
    y: {
      title: { display: true, text: "Count" },
    },
  },
  animation: {
    duration: 1000,
    easing: "easeInOutCubic",
  },
  plugins: {
    legend: { display: false },
  },
};
classDistributionChart.addSeries(classDistributionData, "Count");

const accuracyChart = genericChart({ preset: 'line' });
accuracyChart.title = "📈 Accuracy Evolution";
accuracyChart.options = {
  scales: {
    x: {
      title: { display: true, text: "Version" },
      ticks: { autoSkip: true },
    },
    y: {
      title: { display: true, text: "Accuracy" },
    },
  },
  animation: {
    duration: 1000,
    easing: "easeInOutCubic",
  },
  plugins: {
    legend: { display: false },
  },
};
accuracyChart.addSeries(accuracyData, "Accuracy");

const precisionChart = genericChart({ preset: 'line' });
precisionChart.title = "📈 Precision Evolution";
precisionChart.options = {
  scales: {
    x: {
      title: { display: true, text: "Version" },
      ticks: { autoSkip: true },
    },
    y: {
      title: { display: true, text: "Precision" },
    },
  },
  animation: {
    duration: 1000,
    easing: "easeInOutCubic",
  },
  plugins: {
    legend: { display: false },
  },
};
const varianceChart = genericChart({ preset: 'line' });
varianceChart.title = "📊 Uncertainty/Variance Evolution";
varianceChart.options = {
  scales: {
    x: {
      title: { display: true, text: "Version" },
      ticks: { autoSkip: true },
    },
    y: {
      title: { display: true, text: "Variance" },
    },
  },
  animation: {
    duration: 1000,
    easing: "easeInOutCubic",
  },
  plugins: {
    legend: { display: false },
  },
};
varianceChart.addSeries(varianceData, "Variance");

const stepSlider = slider({
  values: [1],
  min: 1,
  max: 10,
  step: 1,
});
stepSlider.title = "🔄 Model Version";

const metricsData = createStream([]);

const metricsChart = genericChart({ preset: 'bar' });
metricsChart.title = "📊 Model Metrics (Precision, Recall, F1 Score)";
metricsChart.options = {
  scales: {
    x: {
      title: { display: true, text: "Metric" },
    },
    y: {
      title: { display: true, text: "Score" },
    },
  },
  animation: {
    duration: 500,
    easing: "easeInOutCubic",
  },
  plugins: {
    legend: { display: false },
  },
};
metricsChart.addSeries(metricsData, "Score");

function updateMetricsChart(result) {
  const stepIndex = stepSlider.$values.get()[0];

  if (result.precision && result.recall && result.f1) {
    const updatedMetrics = [
      { x: "Precision", y: result.precision[stepIndex - 1] },
      { x: "Recall", y: result.recall[stepIndex - 1] },
      { x: "F1 Score", y: result.f1[stepIndex - 1] },
    ];
    metricsData.set(updatedMetrics);
  }
}

stepSlider.$values.set([2]);
stepSlider.$max.set(3);

async function fetchResults() {
  try {
    const response = await fetch("http://localhost:8000/get_results");
    if (!response.ok) throw new Error("Error fetching results");

    const result = await response.json();

    if (result) {
      if (result.accuracy) {
        const updatedAccuracy = result.accuracy.map((value, index) => ({ x: index + 1, y: value }));
        accuracyData.set(updatedAccuracy);

        console.log(result.accuracy.length);
        const newMax = result.accuracy.length;
        if (newMax !== stepSlider.$max.get()) {
          stepSlider.$max.set(newMax);
          stepSlider.$values.set([newMax]);
        }
      }
      if (result.variance) {
        const updatedVariance = result.variance.map((value, index) => ({ x: index + 1, y: value }));
        varianceData.set(updatedVariance);
      }
      classDistributionData.set([
        { x: "Positive", y: result.n_positives },
        { x: "Negative", y: result.n_negatives }
      ]);
      updateMetricsChart(result);
    }
  } catch (error) {
    console.error("Error fetching results:", error);
  }
}

stepSlider.$values.subscribe(() => {
  fetchResults();
});

setInterval(fetchResults, 1000);

//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------


const trainingInfoText = text(`
  <div style="text-align: center; padding: 10px; font-size: 16px; font-weight: bold; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">
    📢 <strong>Model Update Instructions</strong><br><br>
    This page allows you to update the model once enough labeled data has been collected.<br><br>
    ⚠️ <strong>Threshold Guidelines, Let’s avoid pollution :</strong><br>
    - 🔴 <strong>Below 50 samples</strong>: <span style="color: #dc3545;">Highly discouraged</span><br>
    - 🟠 <strong>Between 50 and 70 samples</strong>: <span style="color: #ffc107;">Possible but not recommended</span><br>
    - 🟢 <strong>Above 70 samples</strong>: <span style="color: #28a745;">Safe to train</span><br><br>
    When ready, click <strong>"Update the Model"</strong> to start training. TensorBoard will provide real-time updates.
  </div>
`);
trainingInfoText.title = "ℹ️ Training Guidelines";

const newDataStream = createStream([]);

const newDataChart = genericChart({ preset: 'bar' });
newDataChart.title = "📊 Data labeled by the Oracle";
newDataChart.options = {
  scales: {
    x: {
      title: { display: true, text: "Class" },
      ticks: { autoSkip: false },
    },
    y: {
      title: { display: true, text: "Count" },
    },
  },
  animation: {
    duration: 500,
    easing: "easeInOutCubic",
  },
  plugins: {
    legend: { display: false },
  },
};
newDataChart.addSeries(newDataStream, "Count");

const newDataText = text(`
  <div style="text-align: center; padding: 10px; font-size: 16px; font-weight: bold; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd;">
    🟢 Positive Images: <span id="positive-count" style="font-size: 18px; font-weight: bold;">0</span><span id="positive-total" style="font-size: 18px; font-weight: bold;">/70</span><br>
    🔴 Negative Images: <span id="negative-count" style="font-size: 18px; font-weight: bold;">0</span><span id="negative-total" style="font-size: 18px; font-weight: bold;">/70</span>
  </div>
`);
newDataText.title = "📊 Data labeled by the Oracle";

function updateNewDataText(nPositives, nNegatives) {
  const posElement = document.getElementById("positive-count");
  const posTotalElement = document.getElementById("positive-total");
  const negElement = document.getElementById("negative-count");
  const negTotalElement = document.getElementById("negative-total");

  if (posElement && posTotalElement && negElement && negTotalElement) {
    posElement.textContent = nPositives;
    negElement.textContent = nNegatives;

    let posColor = nPositives < 50 ? "#dc3545" : nPositives < 70 ? "#ffc107" : "#28a745";
    let negColor = nNegatives < 50 ? "#dc3545" : nNegatives < 70 ? "#ffc107" : "#28a745";

    posElement.style.color = posColor;
    posTotalElement.style.color = posColor;

    negElement.style.color = negColor;
    negTotalElement.style.color = negColor;
  }
}

async function fetchNewData() {
  try {
    const response = await fetch("http://localhost:8000/get_n_new_data");
    if (!response.ok) throw new Error("Error fetching new labeled data");

    const result = await response.json();

    if (result) {
      newDataStream.set([
        { x: "Positive", y: result.n_positives },
        { x: "Negative", y: result.n_negatives }
      ]);
      updateNewDataText(result.n_positives, result.n_negatives);
    }
  } catch (error) {
    console.error("Error fetching new labeled data:", error);
  }
}

setInterval(fetchNewData, 1000);

const updateModelButton = button('⚠️ Update the Model');
updateModelButton.$type.set('danger');
updateModelButton.$disabled.set(false);
updateModelButton.title = "";

const tensorboardText = text(`
  <div id="tensorboard-container" style="text-align: center; padding: 10px; font-size: 16px; font-weight: bold; background: #f8f9fa; border-radius: 8px; border: 1px solid #ddd; display: none;">
    📊 <strong>TensorBoard Running...</strong><br>
    <iframe id="tensorboard-frame" src="" width="100%" height="500px" style="border-radius: 8px; border: 1px solid #ddd;"></iframe>
  </div>
`);
tensorboardText.title = "📡 Model Training Progress";

updateModelButton.$click.subscribe(async () => {
  updateModelButton.$disabled.set(true);

  try {
    const response = await fetch("http://localhost:8000/ask_training", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Error starting training process");
    }

    console.log("✅ Training started!");

    setTimeout(() => {
      document.getElementById("tensorboard-container").style.display = "block";
      document.getElementById("tensorboard-frame").src = "http://localhost:6006/";
    }, 3000);
  } catch (error) {
    console.error("❌ Error launching training:", error);
  }
});


//---------------------------------------------------------------------------------
//---------------------------------------------------------------------------------

const homePageText = text(`
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; font-size: 20px; font-weight: bold;">
    <img src="saclay.png" alt="Université Paris Saclay" style="position: absolute; top: 20px; right: 20px; width: 150px;">
    <h1 style="font-size: 36px; margin-bottom: 20px;">BNN Teaching through Active Learning Interface</h1>
    <p style="font-size: 20px;">Ilan ALIOUCHOUCHE • Feddy IMMOULA • Nadja ZIVKOVIC</p>
    <p style="font-size: 18px; margin-top: 10px;">Université Paris Saclay</p>
    <a href="https://github.com/ilanaliouchouche/Model-Teaching-in-Health-With-BNN-and-Active-Learning" target="_blank" style="margin-top: 30px;">
      <img src="github.webp" alt="GitHub Repository" style="width: 80px;">
    </a>
  </div>
`);
homePageText.title = "🏠 Home";


const contactInfoText = text(`
  <div style="text-align: left; padding: 10px; font-size: 16px; font-weight: bold;">
    📩 <strong>Any questions or inquiries?</strong><br>
    Contact us at:<br>
    📧 <a href="mailto:ilan.aliouchouche@universite-paris-saclay.fr?subject=Active Learning Interface Project&body=Hi, I am contacting you because I have a question related to your Active Learning Interface Project:" style="color: #007bff; text-decoration: none;">
      ilan.aliouchouche@universite-paris-saclay.fr
    </a><br>
    📧 <a href="mailto:feddy.immoula@universite-paris-saclay.fr?subject=Active Learning Interface Project&body=Hi, I am contacting you because I have a question related to your Active Learning Interface Project:" style="color: #007bff; text-decoration: none;">
      feddy.immoula@universite-paris-saclay.fr
    </a>
    <br>
    📧 <a href="mailto:zivkovicnadja22@gmail.com?subject=Active Learning Interface Project&body=Hi, I am contacting you because I have a question related to your Active Learning Interface Project:" style="color: #007bff; text-decoration: none;">
    zivkovicnadja22@gmail.com
  </div>
`);
contactInfoText.title = "📧 Contact";

const githubInfoText = text(`
  <div style="text-align: left; padding: 10px; font-size: 16px; font-weight: bold;">
    🐙 <a href="https://github.com/ilanaliouchouche" target="_blank" style="color: #007bff; text-decoration: none;">
      github.com/ilanaliouchouche
    </a><br>
    🐙 <a href="https://github.com/feddy321" target="_blank" style="color: #007bff; text-decoration: none;">
      github.com/feddy321
    </a><br>
    🐙 <a href="https://github.com/nadjazivkovic03" target="_blank" style="color: #007bff; text-decoration: none;">
      github.com/nadjazivkovic03
  </div>
`);
githubInfoText.title = "🐙 Gitub";

const dash = dashboard({
  title: '⚕️ Easy Active Learning',
  author: 'Ilan Aliouchouche',
});

dash.page('🏠 Home')
  .sidebar(contactInfoText, githubInfoText)
  .use(homePageText);

dash.page('👩‍🏫 Machine Teaching')
  .sidebar(input, t2, labelSelect, validateButton, probabilityVarianceText, imageDisplayComponent)
  .use(t1, imageDatasetBrowser, thresholdSlider, analyzeButton, uncertaintyExplanationText, chartComponent);

dash.page('📚 Training')
  .sidebar(newDataText, newDataChart)
  .use(trainingInfoText, updateModelButton, tensorboardText);

dash.page('📈 Report')
  .sidebar(classDistributionChart, metricsInstructions, stepSlider, metricsChart)
  .use(reportInfoText, accuracyChart, varianceChart);

dash.settings.datasets(imageDataset);

dash.show();