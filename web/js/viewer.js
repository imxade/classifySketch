const { samples, featureNames } = features;
const trainingSamples = training.samples;
const testingSamples = testing.samples;

const k = 50;
const kNN = new KNN(trainingSamples, k);
let correctCount = 0;
let totalCount = 0;
for (const testSample of testingSamples) {
  testSample.truth = testSample.label;
  testSample.label = "?";
  const { label } = kNN.predict(testSample.point);
  testSample.label = label;
  testSample.correct = testSample.label == testSample.truth;
  totalCount++;
  correctCount += testSample.correct ? 1 : 0;
}
statistics.innerHTML =
  "<b>ACCURACY</b><br>" +
  correctCount +
  "/" +
  totalCount +
  " (" +
  utils.formatPercent(correctCount / totalCount) +
  ")";

const trainingGroups = utils.groupBy(trainingSamples, "student_id");
for (let student_id in trainingGroups) {
  const samples = trainingGroups[student_id];
  const studentName = samples[0].student_name;
  createRow(container, studentName, samples);
}

const subtitle = document.createElement("h2");
subtitle.innerHTML = "TESTING";
container.appendChild(subtitle);

const testingGroups = utils.groupBy(testingSamples, "student_id");
for (let student_id in testingGroups) {
  const samples = testingGroups[student_id];
  const studentName = samples[0].student_name;
  createRow(container, studentName, samples);
}

const options = {
  size: 500,
  axesLabels: featureNames,
  styles: utils.styles,
  transparency: 0.7,
  icon: "image",
  bg: new Image(),
};
options.bg.src = constants.DECISION_BOUNDARY;
graphics.generateImages(utils.styles);

const chart = new Chart(chartContainer, trainingSamples, options, handleClick);

const sketchPad = new SketchPad(inputContainer, onDrawingUpdate);
sketchPad.canvas.style.cssText += "outline:10000px solid rgba(0,0,0,0.7);";
// disable sketch padby default
// toggleInput();

function onDrawingUpdate(paths) {
  const functions = featureFunctions.inUse.map((f) => f.function);
  point = functions.map((f) => f(paths));
  utils.normalizePoints([point], minMax);
  const { label, nearestSamples } = kNN.predict(point);
  predictedLabelContainer.innerHTML = "Is it a " + label + " ?";
  chart.showDynamicPoint(point, label, nearestSamples);
}
