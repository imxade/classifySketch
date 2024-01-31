let index = 0;
const labels = [
  "car",
  "fish",
  "house",
  "tree",
  "bicycle",
  "guitar",
  "pencil",
  "clock",
];

const data = {
  student: null,
  session: new Date().getTime(),
  drawings: {},
};

const sketchPad = new SketchPad(document.getElementById("sketchPadContainer"));

const student = document.getElementById("student");
const sketchPadContainer = document.getElementById("sketchPadContainer");
const instructions = document.getElementById("instructions");
const advanceBtn = document.getElementById("advanceBtn");

advanceBtn.onclick = start;

function start() {
  if (student.value === "") {
    alert("Please type your name first!");
    return;
  }
  data.student = student.value;
  student.style.display = "none";
  sketchPadContainer.style.visibility = "visible";
  const label = labels[index];
  instructions.innerHTML = "Please draw a " + label;
  advanceBtn.innerHTML = "NEXT";
  advanceBtn.onclick = next;
}

function next() {
  if (sketchPad.paths.length === 0) {
    alert("Draw something first!");
    return;
  }

  const label = labels[index];
  data.drawings[label] = sketchPad.paths;
  sketchPad.reset();
  index++;
  if (index < labels.length) {
    const nextLabel = labels[index];
    instructions.innerHTML = "Please draw a " + nextLabel;
  } else {
    sketchPadContainer.style.visibility = "hidden";
    instructions.innerHTML = "Thank you!";
    advanceBtn.innerHTML = "SAVE";
    advanceBtn.onclick = save;
  }
}

function download() {
  advanceBtn.style.display = "none";
  instructions.innerHTML =
    "Take your downloaded file and place it alongside the others in the dataset!";

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(data)),
  );

  const fileName = data.session + ".json";
  element.setAttribute("download", fileName);

  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function trainModel() {
  advanceBtn.style.display = "none";
  instructions.innerHTML = "Training...";

  fetch("/train", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(""),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        instructions.innerHTML = "Trained successfully!";
        advanceBtn.innerHTML = "TEST";
        advanceBtn.onclick = () => (window.location.href = "/test");
        advanceBtn.style.display = "block";
      } else {
        instructions.innerHTML =
          "Failed to train. " + (data.error || "Unknown error");
      }
    })
    .catch((error) => {
      instructions.innerHTML = "An error occurred while training.";
      console.error("Error training:", error);
    });
}

function save() {
  advanceBtn.style.display = "none";
  instructions.innerHTML = "Saving your data...";

  // Assuming data is already defined
  fetch("/saveJson", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (response.ok) {
        instructions.innerHTML = "Data saved successfully!";
        advanceBtn.innerHTML = "TRAIN";
        advanceBtn.onclick = trainModel;
        advanceBtn.style.display = "block";
      } else {
        instructions.innerHTML = "Failed to save data.";
      }
    })
    .catch((error) => {
      instructions.innerHTML = "An error occurred while saving data.";
      console.error("Error saving data:", error);
    });
}
