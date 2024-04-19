/**
 * Initial size of the brush in the application.
 * @const {number} INITIAL_VALUE - Default value for brush size, initially set to 10.
 */
const INITIAL_VALUE = 10;

/**
 * Height of the toolbar in pixels.
 * @const {number} TOOLBAR_WIDTH - Represents the fixed height of the toolbar area, set to 50 pixels.
 */
const TOOLBAR_WIDTH = 50;

/**
 * Time in milliseconds to display a tool's activity message before switching back to the brush.
 * @const {number} BRUSH_TIME - Delay for temporary tool messages, set to 1500 milliseconds.
 */
const BRUSH_TIME = 1500;

/**
 * Stores the current active tool element from the DOM.
 * @const {HTMLElement} activeToolEl - Element that displays the currently active tool.
 */
const activeToolEl = document.getElementById('active-tool');

/**
 * Button for selecting brush color.
 * @const {HTMLInputElement} brushColorBtn - Input element for changing the brush color.
 */
const brushColorBtn = document.getElementById('brush-color');

/**
 * Icon for the brush tool.
 * @const {HTMLElement} brushIcon - Icon element representing the brush tool.
 */
const brushIcon = document.getElementById('brush');

/**
 * Display for the current brush size.
 * @const {HTMLElement} brushSize - Element displaying the current size of the brush.
 */
const brushSize = document.getElementById('brush-size');

/**
 * Slider for adjusting the brush size.
 * @const {HTMLInputElement} brushSlider - Input range element to adjust the brush size.
 */
const brushSlider = document.getElementById('brush-slider');

/**
 * Button for selecting the bucket (background) color.
 * @const {HTMLInputElement} bucketColorBtn - Input element for changing the background color.
 */
const bucketColorBtn = document.getElementById('bucket-color');

/**
 * Icon for the eraser tool.
 * @const {HTMLElement} eraser - Icon element representing the eraser tool.
 */
const eraser = document.getElementById('eraser');

/**
 * Button for clearing the canvas.
 * @const {HTMLElement} clearCanvasBtn - Icon element used to clear the canvas.
 */
const clearCanvasBtn = document.getElementById('clear-canvas');

/**
 * Button for saving the current canvas state to local storage.
 * @const {HTMLElement} saveStorageBtn - Icon element used to save canvas state to local storage.
 */
const saveStorageBtn = document.getElementById('save-storage');

/**
 * Button for loading the canvas state from local storage.
 * @const {HTMLElement} loadStorageBtn - Icon element used to load canvas state from local storage.
 */
const loadStorageBtn = document.getElementById('load-storage');

/**
 * Button for clearing the canvas state from local storage.
 * @const {HTMLElement} clearStorageBtn - Icon element used to clear canvas state from local storage.
 */
const clearStorageBtn = document.getElementById('clear-storage');

/**
 * Link element for downloading the canvas as an image file.
 * @const {HTMLAnchorElement} downloadBtn - Anchor element for downloading the canvas content as an image.
 */
const downloadBtn = document.getElementById('download');

/**
 * Destructures and stores a reference to the document's body.
 * @const {HTMLBodyElement} body - Reference to the HTML body element, used for appending the canvas and handling global behaviors.
 */
const { body } = document;

/**
 * Represents the canvas element.
 * @const {HTMLCanvasElement} canvas - Canvas element for drawing.
 */
const canvas = document.createElement('canvas');
canvas.id = 'canvas';

/**
 * The 2D context of the canvas, used for drawing operations.
 * @const {CanvasRenderingContext2D} context - Context provides methods to draw and manipulate graphics on the canvas.
 */
const context = canvas.getContext('2d');

/**
 * Current size of the brush or eraser.
 * @var {number} currentSize - Currently set size of the drawing tool.
 */
let currentSize = INITIAL_VALUE;

/**
 * Current color of the bucket tool.
 * @var {string} bucketColor - Currently set background color of the canvas.
 */
let bucketColor = '#FFFFFF';

/**
 * Current color of the brush.
 * @var {string} currentColor - Currently set color of the brush.
 */
let currentColor = '#000000';

/**
 * Indicates whether the eraser tool is active.
 * @var {boolean} isEraser - True if the eraser tool is active, false otherwise.
 */
let isEraser = false;

/**
 * Indicates whether the mouse is pressed down on the canvas.
 * @var {boolean} isMouseDown - True if the mouse is currently down, used to handle drawing as the mouse moves.
 */
let isMouseDown = false;

/**
 * Array to store the lines drawn on the canvas.
 * @var {Array<Object>} drawnArray - Array of objects describing each line segment drawn on the canvas.
 */
let drawnArray = [];

/**
 * Updates the display of the brush size in the UI.
 */
function displayBrushSize() {
  if (brushSlider.value < INITIAL_VALUE) {
    brushSize.textContent = `0${brushSlider.value}`;
  } else {
    brushSize.textContent = brushSlider.value;
  }
}

/**
 * Sets the application state to use the brush tool.
 */
function switchToBrush() {
  isEraser = false;
  activeToolEl.textContent = 'Brush';
  brushIcon.style.color = 'black';
  eraser.style.color = 'white';
  currentColor = `#${brushColorBtn.value}`;
  currentSize = INITIAL_VALUE;
  brushSlider.value = INITIAL_VALUE;

  displayBrushSize();
}

/**
 * Temporarily switches the tool to Brush after a specified timeout.
 * @param {number} ms - Milliseconds to delay before switching back to the brush.
 */
function brushTimeSetTimeout(ms) {
  setTimeout(switchToBrush, ms);
}

/**
 * Initializes the canvas with default settings and adds it to the body of the document.
 */
function createCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - TOOLBAR_WIDTH;
  context.fillStyle = bucketColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  body.appendChild(canvas);
  switchToBrush();
}

/**
 * Calculates and returns the mouse position relative to the canvas.
 * @param {MouseEvent} event - The mouse event to calculate the position from.
 * @returns {Object} - The x and y coordinates of the mouse relative to the canvas.
 */
function getMousePosition(event) {
  const boundaries = canvas.getBoundingClientRect();
  return {
    x: event.clientX - boundaries.left,
    y: event.clientY - boundaries.top,
  };
}

/**
 * Restores the canvas drawing from the drawnArray.
 */
function restoreCanvas() {
  for (let i = 1; i < drawnArray.length; i++) {
    context.beginPath();
    context.moveTo(drawnArray[i - 1].x, drawnArray[i - 1].y);
    context.lineWidth = drawnArray[i].size;
    context.lineCap = 'round';

    if (drawnArray[i].eraser) {
      context.strokeStyle = bucketColor;
    } else {
      context.strokeStyle = drawnArray[i].color;
    }

    context.lineTo(drawnArray[i].x, drawnArray[i].y);
    context.stroke();
  }
}

/**
 * Stores the details of each line segment drawn in an array.
 * @param {number} x - X-coordinate of the line segment.
 * @param {number} y - Y-coordinate of the line segment.
 * @param {number} size - Size of the brush or eraser used for the line segment.
 * @param {string} color - Color of the line segment.
 * @param {boolean} erase - Indicates whether the segment was erased.
 */
function storeDrawn(x, y, size, color, erase) {
  const line = {
    x,
    y,
    size,
    color,
    erase,
  };

  drawnArray.push(line);
}

/**
 * Sets the brush tool as the active tool when the brush icon is clicked.
 */
brushIcon.addEventListener('click', switchToBrush);

/**
 * Updates the brush size based on the slider value and updates the display accordingly.
 */
brushSlider.addEventListener('change', () => {
  currentSize = brushSlider.value;
  displayBrushSize();
});

/**
 * Sets the brush color and disables eraser mode when a new color is selected.
 */
brushColorBtn.addEventListener('change', () => {
  isEraser = false;
  currentColor = `#${brushColorBtn.value}`;
});

/**
 * Updates the background color of the canvas and redraws the canvas to reflect the change.
 */
bucketColorBtn.addEventListener('change', () => {
  bucketColor = `#${bucketColorBtn.value}`;
  createCanvas();
  restoreCanvas();
});

/**
 * Activates the eraser tool and updates the UI to reflect the current tool.
 */
eraser.addEventListener('click', () => {
  isEraser = true;
  brushIcon.style.color = 'white';
  eraser.style.color = 'black';
  activeToolEl.textContent = 'Eraser';
  currentColor = bucketColor;
  currentSize = 50;
});

/**
 * Begins drawing on the canvas when the mouse is pressed down.
 * @param {MouseEvent} event - The mouse event that triggers drawing.
 */
canvas.addEventListener('mousedown', (event) => {
  isMouseDown = true;
  const currentPosition = getMousePosition(event);

  context.moveTo(currentPosition.x, currentPosition.y);
  context.beginPath();
  context.lineWidth = currentSize;
  context.lineCap = 'round';
  context.strokeStyle = currentColor;
});

/**
 * Continues to draw on the canvas as the mouse moves if the mouse button is held down.
 * @param {MouseEvent} event - The mouse event that triggers drawing.
 */
canvas.addEventListener('mousemove', (event) => {
  if (isMouseDown) {
    const currentPosition = getMousePosition(event);

    context.lineTo(currentPosition.x, currentPosition.y);
    context.stroke();
    storeDrawn(currentPosition.x, currentPosition.y, currentSize, currentColor, isEraser);
  } else {
    storeDrawn(undefined);
  }
});

/**
 * Ends the drawing on the canvas when the mouse button is released.
 */
canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
});

/**
 * Clears the entire canvas and resets the drawing array.
 */
clearCanvasBtn.addEventListener('click', () => {
  createCanvas();
  drawnArray = [];

  activeToolEl.textContent = 'Canvas Cleared';
  brushTimeSetTimeout(BRUSH_TIME);
});

/**
 * Saves the current state of the canvas to local storage.
 */
saveStorageBtn.addEventListener('click', () => {
  localStorage.setItem('savedCanvas', JSON.stringify(drawnArray));

  activeToolEl.textContent = 'Canvas Saved';
  brushTimeSetTimeout(BRUSH_TIME);
});

/**
 * Loads the canvas state from local storage if available and restores it.
 */
loadStorageBtn.addEventListener('click', () => {
  if (localStorage.getItem('savedCanvas')) {
    drawnArray = JSON.parse(localStorage.savedCanvas);
    restoreCanvas();

    activeToolEl.textContent = 'Canvas Loaded';
    brushTimeSetTimeout(BRUSH_TIME);
  } else {
    activeToolEl.textContent = 'No Canvas found';
    brushTimeSetTimeout(BRUSH_TIME);
  }
});

/**
 * Clears the saved canvas state from local storage.
 */
clearStorageBtn.addEventListener('click', () => {
  localStorage.removeItem('savedCanvas');

  activeToolEl.textContent = 'Local Storage Cleared';
  brushTimeSetTimeout(BRUSH_TIME);
});

/**
 * Sets up the download button to save the canvas as a JPEG image file.
 */
downloadBtn.addEventListener('click', () => {
  downloadBtn.href = canvas.toDataURL('image/jpeg', 1);
  downloadBtn.download = 'paint-example.jpeg';

  activeToolEl.textContent = 'Image File Saved';
  brushTimeSetTimeout(BRUSH_TIME);
});

/**
 * Initializes the canvas when the document loads.
 */
createCanvas();
