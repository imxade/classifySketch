class SketchPad {
  constructor(container, onUpdate = null, size = 400) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = size;
    this.canvas.height = size;
    this.canvas.classList.add("sketchpad-canvas");
    container.appendChild(this.canvas);

    this.undoBtn = document.createElement("button");
    this.undoBtn.innerHTML = "UNDO";
    this.undoBtn.classList.add("sketchpad-button");
    container.appendChild(this.undoBtn);

    this.ctx = this.canvas.getContext("2d");

    this.onUpdate = onUpdate;

    this.reset();

    this.addEventListeners();
  }

  reset() {
    this.paths = [];
    this.isDrawing = false;
    this.redraw();
  }

  addEventListeners() {
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    document.addEventListener("pointerup", this.onPointerUp);

    this.canvas.addEventListener("touchstart", this.onTouchStart);
    this.canvas.addEventListener("touchmove", this.onTouchMove);
    document.addEventListener("touchend", this.onTouchEnd);

    this.undoBtn.addEventListener("click", this.onUndoBtnClick);
  }

  onPointerDown = (evt) => {
    const pointer = this.getPointer(evt);
    this.paths.push([pointer]);
    this.isDrawing = true;
  };

  onPointerMove = (evt) => {
    if (this.isDrawing) {
      const pointer = this.getPointer(evt);
      const lastPath = this.paths[this.paths.length - 1];
      lastPath.push(pointer);
      this.redraw();
    }
  };

  onPointerUp = () => {
    this.isDrawing = false;
  };

  onTouchStart = (evt) => {
    const loc = evt.touches[0];
    this.onPointerDown(loc);
  };

  onTouchMove = (evt) => {
    const loc = evt.touches[0];
    this.onPointerMove(loc);
  };

  onTouchEnd = () => {
    this.onPointerUp();
  };

  onUndoBtnClick = () => {
    this.paths.pop();
    this.redraw();
  };

  redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    draw.paths(this.ctx, this.paths);
    this.undoBtn.disabled = this.paths.length === 0;
    this.triggerUpdate();
  }

  triggerUpdate() {
    if (this.onUpdate) {
      this.onUpdate(this.paths);
    }
  }

  getPointer(evt) {
    const rect = this.canvas.getBoundingClientRect();
    return [
      Math.round(evt.clientX - rect.left),
      Math.round(evt.clientY - rect.top),
    ];
  }
}
