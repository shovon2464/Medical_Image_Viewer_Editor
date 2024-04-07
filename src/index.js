// Importing necessary libraries
import '@kitware/vtk.js/favicon';
import '@kitware/vtk.js/Rendering/Profiles/Volume';
import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import macro from '@kitware/vtk.js/macros';
import HttpDataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import vtkBoundingBox from '@kitware/vtk.js/Common/DataModel/BoundingBox';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkVolumeController from '@kitware/vtk.js/Interaction/UI/VolumeController';
import vtkURLExtract from '@kitware/vtk.js/Common/Core/URLExtract';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkXMLImageDataReader from '@kitware/vtk.js/IO/XML/XMLImageDataReader';
import vtkFPSMonitor from '@kitware/vtk.js/Interaction/UI/FPSMonitor';
import vtkImageCropFilter from '@kitware/vtk.js/Filters/General/ImageCropFilter';
// Force DataAccessHelper to have access to various data source
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HtmlDataAccessHelper';
import '@kitware/vtk.js/IO/Core/DataAccessHelper/JSZipDataAccessHelper';
import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper';
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import vtkHttpDataSetReader from '@kitware/vtk.js/IO/Core/HttpDataSetReader';
import vtkImageMarchingCubes from '@kitware/vtk.js/Filters/General/ImageMarchingCubes';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import  controlPanelISO from "./controlPanelISO.html";
import style from 'style-loader!css-loader?modules!./customstyles.css';
import vtkPiecewiseGaussianWidget from '@kitware/vtk.js/Interaction/Widgets/PiecewiseGaussianWidget';
// Force the loading of HttpDataAccessHelper to support gzip decompression
import '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';






const __BASE_PATH__ = "../"; // Define your base path here



let buttonContainer1, buttonContainer2, buttonContainer3, buttonContainer4, buttonContainer5



let autoInit = true;
//extracting URL paramters
const userParams = vtkURLExtract.extractURLParameters();
//initializing FPS monitor   
const fpsMonitor = vtkFPSMonitor.newInstance(); 
// ----------------------------------------------------------------------------

//This function is for removing front page after uploading the vti file
function emptyContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}
// ----------------------------------------------------------------------------
//This preventDefault() method of the Event interface tells the user agent that 
//if the event does not get explicitly handled, 
//its default action should not be taken as it normally would be.
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}
// ----------------------------------------------------------------------------

function createViewerSegmentation(rootContainer, fileContents, options) {

  /*
  const div1 = document.createElement("div");
  rootContainer.appendChild(div1);

  const background = [0, 0, 0];
  const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    background,
    rootContainer: div1,
  });

  const renderer = fullScreenRenderer.getRenderer();
  const renderWindow = fullScreenRenderer.getRenderWindow();
  renderWindow.getInteractor().setDesiredUpdateRate(15);

  // Set the size and z-index of the fullScreenRenderer container
  fullScreenRenderer.getContainer().style.width = "1420px";
  fullScreenRenderer.getContainer().style.height = "780px";
  fullScreenRenderer.getContainer().style.marginLeft = "20%";
  fullScreenRenderer.getContainer().style.marginTop =  "0%";

  // Resize the fullScreenRenderer1
  fullScreenRenderer.resize();

   // Load the .vti file using vtk.js
  const vtiReader = vtkXMLImageDataReader.newInstance({ fetchGzip: true });
  vtiReader.parseAsArrayBuffer(fileContents);
  const source = vtiReader.getOutputData();

  const thresholdMin = 100; // Minimum intensity threshold
  const thresholdMax = 200; // Maximum intensity threshold
  const threshold = vtkImageThreshold.newInstance({
    lowerThreshold: thresholdMin,
    upperThreshold: thresholdMax,
  });

  threshold.setInputData(vtiReader.getOutputData());
  // Apply marching cubes to extract contours
  const marchingCubes = vtkImageMarchingCubes.newInstance({
    contourValue: 0.0, // Adjust contour value as needed
  });
  marchingCubes.setInputConnection(threshold.getOutputPort());

  const mapper = vtkVolumeMapper.newInstance();
  const actor = vtkVolume.newInstance();

  actor.setMapper(mapper);
  mapper.setInputData(segmentedImage);

   // Add the segmented actor to the renderer
   renderer.addActor(actor);
   renderer.resetCamera();
   renderWindow.render();
   */

}


function createViewerVolume(rootContainer, fileContents, options) {
  const div1 = document.createElement("div");
  rootContainer.appendChild(div1);

  const background = [0, 0, 0];
  //rootContainer.classList.add("content");

  // Create the fullScreenRenderer1 and add it to the div1 container
  const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    background,
    rootContainer: div1,
  });

  const renderer = fullScreenRenderer.getRenderer();
  const renderWindow = fullScreenRenderer.getRenderWindow();
  renderWindow.getInteractor().setDesiredUpdateRate(15);

  // Set the size and z-index of the fullScreenRenderer container
  fullScreenRenderer.getContainer().style.width = "1420px";
  fullScreenRenderer.getContainer().style.height = "780px";
  fullScreenRenderer.getContainer().style.marginLeft = "20%";
  fullScreenRenderer.getContainer().style.marginTop =  "0%";

  // Resize the fullScreenRenderer1
  fullScreenRenderer.resize();


  const vtiReader = vtkXMLImageDataReader.newInstance({ fetchGzip: true });
  vtiReader.parseAsArrayBuffer(fileContents);
  const source = vtiReader.getOutputData();

  const mapper = vtkVolumeMapper.newInstance();
  const actor = vtkVolume.newInstance();

  mapper.setInputConnection(vtiReader.getOutputPort());


  const dataArray =
    source.getPointData().getScalars() || source.getPointData().getArrays()[0];
  const dataRange = dataArray.getRange();

 //initializing the color transfer and opacity transfer function 
  //and adding the control panel
  const lookupTable = vtkColorTransferFunction.newInstance();
  const piecewiseFunction = vtkPiecewiseFunction.newInstance();

  actor.setMapper(mapper);
  mapper.setInputData(source);

  // Configuration
  const sampleDistance =
    0.7 *
    Math.sqrt(
      source
        .getSpacing()
        .map((v) => v * v)
        .reduce((a, b) => a + b, 0)
    );
  mapper.setSampleDistance(sampleDistance);
  actor.getProperty().setRGBTransferFunction(0, lookupTable);
  actor.getProperty().setScalarOpacity(0, piecewiseFunction);
  actor.getProperty().setInterpolationTypeToFastLinear();
  actor.getProperty().setInterpolationTypeToLinear();

   // For better looking volume rendering
   actor
   .getProperty()
   .setScalarOpacityUnitDistance(
     0,
     vtkBoundingBox.getDiagonalLength(source.getBounds()) /
       Math.max(...source.getDimensions())
   );

  actor.getProperty().setGradientOpacityMinimumValue(0, 0);
  actor
    .getProperty()
    .setGradientOpacityMaximumValue(0, (dataRange[1] - dataRange[0]) * 0.05);

  //setting shading based on gradient
  actor.getProperty().setShade(true);
  actor.getProperty().setUseGradientOpacity(0, true);

  //setting the deafault values
  actor.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
  actor.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
  actor.getProperty().setAmbient(0.2);
  actor.getProperty().setDiffuse(0.7);
  actor.getProperty().setSpecular(0.3);
  actor.getProperty().setSpecularPower(8.0);
  const controllerWidgetDiv = document.createElement("div");
  controllerWidgetDiv.style.marginLeft = "50px";
  rootContainer.append(controllerWidgetDiv)
  const controllerWidget = vtkVolumeController.newInstance({
    size: [300, 200],
    rescaleColorMap: true,
  });
  //setUpContent sets the size to the container.
  controllerWidget.setupContent(renderWindow, actor, true);
  controllerWidget.setContainer(controllerWidgetDiv);
  controllerWidgetDiv.setAttribute('class', style.container);
  
  renderer.addActor(actor);
  renderer.resetCamera();
  renderWindow.render();

  buttonContainer1.addEventListener("click", () => {
    emptyContainer(controllerWidgetDiv);
    load(rootContainer, options);
  });
  buttonContainer2.addEventListener("click", () => {
    emptyContainer(controllerWidgetDiv);
    loadISO(rootContainer,options);
  })
  buttonContainer3.addEventListener("click", () => {
    loadVolume(rootContainer,options);
  })
  buttonContainer5.addEventListener("click", () => {
    const views = renderWindow.getViews();
    views.forEach((view) => {
      view.captureNextImage().then((imageData) => {

        const base64ImageData = imageData;
        // Convert the ImageData object to a Blob

        // Convert the base64 string to a Blob
        const binaryData = atob(base64ImageData.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);

        for (let i = 0; i < binaryData.length; i++) {
          uint8Array[i] = binaryData.charCodeAt(i);
        }

        const blob = new Blob([uint8Array], { type: 'image/png' });

        // Create a temporary anchor element to download the image
        const anchor = document.createElement("a");
        anchor.href = URL.createObjectURL(blob);
        anchor.download = "rendered_image.png";

        // Append the anchor to the document and programmatically trigger a click event
        document.body.appendChild(anchor);
        anchor.click();

        // Clean up by removing the anchor element from the document
        document.body.removeChild(anchor);
      });
    });

  });
}
function createViewerISO(rootContainer, fileContents, options) {

  const div1 = document.createElement("div");
  rootContainer.appendChild(div1);

  const background = [0, 0, 0];
  //rootContainer.classList.add("content");

  // Create the fullScreenRenderer1 and add it to the div1 container
  const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    background,
    rootContainer: div1,
  });

  const renderer = fullScreenRenderer.getRenderer();
  const renderWindow = fullScreenRenderer.getRenderWindow();
  renderWindow.getInteractor().setDesiredUpdateRate(15);

  // Set the size and z-index of the fullScreenRenderer1 container
  fullScreenRenderer.getContainer().style.width = "1420px";
  fullScreenRenderer.getContainer().style.height = "780px";
  fullScreenRenderer.getContainer().style.marginLeft = "20%";
  fullScreenRenderer.getContainer().style.marginTop =  "0%";

  // Resize the fullScreenRenderer1
  fullScreenRenderer.resize();

  fullScreenRenderer.addController(controlPanelISO);

  const vtiReader = vtkXMLImageDataReader.newInstance({ fetchGzip: true });
  vtiReader.parseAsArrayBuffer(fileContents);
  const source = vtiReader.getOutputData();

  const mapper = vtkMapper.newInstance();
  const actor = vtkActor.newInstance();
  
  //initializing marchingcube 
  const marchingCube = vtkImageMarchingCubes.newInstance({
    contourValue: 0.0,
    computeNormals: true,
    mergePoints: true,
  });

  actor.setMapper(mapper);
  mapper.setInputConnection(marchingCube.getOutputPort());

  function updateIsoValue(e) {
    const isoValue = Number(e.target.value);
    marchingCube.setContourValue(isoValue);
    renderWindow.render();
  }
  const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true });
  marchingCube.setInputConnection(vtiReader.getOutputPort());

  const data = source;
  const dataRange = data.getPointData().getScalars().getRange();
  const firstIsoValue = (dataRange[0] + dataRange[1]) / 3;

  const el = document.querySelector('.isoValue');
  el.setAttribute('min', dataRange[0]);
  el.setAttribute('max', dataRange[1]);
  el.setAttribute('value', firstIsoValue);
  el.addEventListener('input', updateIsoValue);
  marchingCube.setContourValue(firstIsoValue);     
  renderer.addActor(actor);
  renderer.getActiveCamera().set({ position: [1, 1, 0], viewUp: [0, 0, -1] });
  renderer.resetCamera();
  renderWindow.render();


  buttonContainer1.addEventListener("click", () => {
    fullScreenRenderer.removeController(controlPanelISO);
    load(rootContainer, options);
  });
  buttonContainer2.addEventListener("click", () => {
    loadISO(rootContainer,options);
  })
  buttonContainer3.addEventListener("click", () => {
    fullScreenRenderer.removeController(controlPanelISO);
    loadVolume(rootContainer,options);
  })
  buttonContainer5.addEventListener("click", () => {
    const views = renderWindow.getViews();
    views.forEach((view) => {
      view.captureNextImage().then((imageData) => {

        const base64ImageData = imageData;
        // Convert the ImageData object to a Blob

        // Convert the base64 string to a Blob
        const binaryData = atob(base64ImageData.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);

        for (let i = 0; i < binaryData.length; i++) {
          uint8Array[i] = binaryData.charCodeAt(i);
        }

        const blob = new Blob([uint8Array], { type: 'image/png' });

        // Create a temporary anchor element to download the image
        const anchor = document.createElement("a");
        anchor.href = URL.createObjectURL(blob);
        anchor.download = "rendered_image.png";

        // Append the anchor to the document and programmatically trigger a click event
        document.body.appendChild(anchor);
        anchor.click();

        // Clean up by removing the anchor element from the document
        document.body.removeChild(anchor);

      });
    });

  });
}

function createViewerRender(rootContainer, fileContents, options) {

  const div1 = document.createElement("div");
  rootContainer.appendChild(div1);

  const background = [0, 0, 0];
  //rootContainer.classList.add("content");

  // Create the fullScreenRenderer1 and add it to the div1 container
  const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    background,
    rootContainer: div1,
  });

  const renderer = fullScreenRenderer.getRenderer();
  const renderWindow = fullScreenRenderer.getRenderWindow();
  renderWindow.getInteractor().setDesiredUpdateRate(15);

  // Set the size and z-index of the fullScreenRenderer1 container
  fullScreenRenderer.getContainer().style.width = "1420px";
  fullScreenRenderer.getContainer().style.height = "780px";
  fullScreenRenderer.getContainer().style.marginLeft = "20%";
  fullScreenRenderer.getContainer().style.marginTop =  "0%";

  // Resize the fullScreenRenderer1
  fullScreenRenderer.resize();

  const vtiReader = vtkXMLImageDataReader.newInstance({ fetchGzip: true });
  vtiReader.parseAsArrayBuffer(fileContents);
  const source = vtiReader.getOutputData();

  const mapper = vtkVolumeMapper.newInstance();
  const actor = vtkVolume.newInstance();

  const dataArray = source.getPointData().getScalars() || source.getPointData().getArrays()[0];
  const dataRange = dataArray.getRange();


  actor.setMapper(mapper);
  mapper.setInputData(source);
  renderer.addActor(actor);
  renderer.resetCamera();
  renderWindow.render();

  buttonContainer1.addEventListener("click", () => {
    load(rootContainer, options);
  });
  buttonContainer2.addEventListener("click", () => {
    loadISO(rootContainer,options);
  })
  buttonContainer3.addEventListener("click", () => {
    loadVolume(rootContainer,options);
  })
  buttonContainer4.addEventListener("click", () => {
    loadSegmentation(rootContainer,options);
  })
  buttonContainer5.addEventListener("click", () => {
    const views = renderWindow.getViews();
    views.forEach((view) => {
      view.captureNextImage().then((imageData) => {

        const base64ImageData = imageData;
        // Convert the ImageData object to a Blob

        // Convert the base64 string to a Blob
        const binaryData = atob(base64ImageData.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);

        for (let i = 0; i < binaryData.length; i++) {
          uint8Array[i] = binaryData.charCodeAt(i);
        }

        const blob = new Blob([uint8Array], { type: 'image/png' });

        // Create a temporary anchor element to download the image
        const anchor = document.createElement("a");
        anchor.href = URL.createObjectURL(blob);
        anchor.download = "rendered_image.png";

        // Append the anchor to the document and programmatically trigger a click event
        document.body.appendChild(anchor);
        anchor.click();

        // Clean up by removing the anchor element from the document
        document.body.removeChild(anchor);

      });
    });

  });
  
}
// ----------------------------------------------------------------------------
// loading data function and checking whether the file is vti or not
export function load(container, options) {
  autoInit = false;
  //emptyContainer(container);

  if (options.file) {
    if (options.ext === "vti") {
      const reader = new FileReader();
      reader.onload = function onLoad(e) {
        createViewerRender(container, reader.result, options);
      };
      reader.readAsArrayBuffer(options.file);
    } else {
      console.error("Unkown file...");
    }
  } 
}
export function loadISO(container, options) {
  autoInit = false;
  //emptyContainer(container);

  if (options.file) {
    if (options.ext === "vti") {
      const reader = new FileReader();
      reader.onload = function onLoad(e) {
        createViewerISO(container, reader.result, options);
      };
      reader.readAsArrayBuffer(options.file);
    } else {
      console.error("Unkown file...");
    }
  } 
}
export function loadVolume(container, options) {
  autoInit = false;
  //emptyContainer(container);

  if (options.file) {
    if (options.ext === "vti") {
      const reader = new FileReader();
      reader.onload = function onLoad(e) {
        createViewerVolume(container, reader.result, options);
      };
      reader.readAsArrayBuffer(options.file);
    } else {
      console.error("Unkown file...");
    }
  } 
}
export function loadSegmentation(container, options) {
  autoInit = false;
  //emptyContainer(container);

  if (options.file) {
    if (options.ext === "vti") {
      const reader = new FileReader();
      reader.onload = function onLoad(e) {
        createViewerSegmentation(container, reader.result, options);
      };
      reader.readAsArrayBuffer(options.file);
    } else {
      console.error("Unkown file...");
    }
  } 
}

//this function is controlling the front page function.
//It is adding the vti file after clicking the upload button
//after uploading transfering the data to the second page that is the main application page
export function initLocalFileLoader(container) {
  const exampleContainer = document.querySelector(".content");
  const rootBody = document.querySelector("body");
  const myContainer = container || exampleContainer || rootBody;
  
  const fileContainer = document.createElement("div");
  fileContainer.innerHTML = `<button class = "${style.dropButton}">Upload Knee MRI</button><div class="${style.bigFileDrop}"/><input type="file" accept=".vti" style="display: none;"/>`
  myContainer.appendChild(fileContainer);

  buttonContainer1 = document.createElement("div");
  buttonContainer1.innerHTML = `<button class="${style.dropButton2}">Render File</button>`
  myContainer.appendChild(buttonContainer1);

  buttonContainer2 = document.createElement("div");
  buttonContainer2.innerHTML = `<button class="${style.dropButton2}">ISO Surface Render</button>`
  myContainer.appendChild(buttonContainer2);

  buttonContainer3 = document.createElement("div");
  buttonContainer3.innerHTML = `<button class="${style.dropButton2}">Volume Render</button>`
  myContainer.appendChild(buttonContainer3);

  buttonContainer4 = document.createElement("div");
  buttonContainer4.innerHTML = `<button class="${style.dropButton2}">Segment Image</button>`
  myContainer.appendChild(buttonContainer4);

  buttonContainer5 = document.createElement("div");
  buttonContainer5.innerHTML = `<button class="${style.dropButton2}">Export</button>`
  myContainer.appendChild(buttonContainer5);


  const emptyContainer = document.createElement("div");
  emptyContainer.innerHTML = `<div class="${style.emptyrenderWindow}"></div>`;
  myContainer.appendChild(emptyContainer);

  const fileInput = fileContainer.querySelector("input");
  var options;
  function handleFile(e) {
    preventDefaults(e);
    const dataTransfer = e.dataTransfer;
    const files = e.target.files || dataTransfer.files;
    if (files.length === 1) {
      buttonContainer1.innerHTML = `<button class="${style.dropButton}">Render File</button>`
      const ext = files[0].name.split(".").slice(-1)[0];
      options = { file: files[0], ext, ...userParams };
      
    }
  }
  //these are codes for how the data file can be added
  fileInput.addEventListener("change", handleFile);
  fileContainer.addEventListener("click", (e) => fileInput.click());
  buttonContainer1.addEventListener("click", () => {
  buttonContainer2.innerHTML = `<button class="${style.dropButton}">ISO Surface Render</button>`
  buttonContainer3.innerHTML = `<button class="${style.dropButton}">Volume Render</button>`
  buttonContainer4.innerHTML = `<button class="${style.dropButton}">Segment Image</button>`
  buttonContainer5.innerHTML = `<button class="${style.dropButton}">Export</button>`
  load(myContainer, options);
  });
}


//it is loading the container with the parameters from the loaded data file
if (userParams.fileURL) {
  const exampleContainer = document.querySelector(".content");
  const rootBody = document.querySelector("body");
  const myContainer = exampleContainer || rootBody;
  load(myContainer, userParams);
}

//loading the data file
const viewerContainers = document.querySelectorAll(".vtkjs-volume-viewer");
let nbViewers = viewerContainers.length;
while (nbViewers--) {
  const viewerContainer = viewerContainers[nbViewers];
  const fileURL = viewerContainer.dataset.url;
  const options = {
    containerStyle: { height: "100%" },
    ...userParams,
    fileURL
  };
  load(viewerContainer, options);
}

function customizeWidget(key) {
  const widgetContainer = document.getElementById("controllerWidgetDiv");
  emptyContainer(widgetContainer);
  const controllerWidgetDiv = document.createElement("div");
  const isoWidget = document.getElementById("isoWidget");
  switch (key) {
    case "Gaussian Widget":
      controllerWidgetDiv.style.zIndex = 2;
      controllerWidgetDiv.style.position = "absolute";
      widgetContainer.append(controllerWidgetDiv);
      const controllerWidget = vtkVolumeController.newInstance({
        size: [280, 150],
        rescaleColorMap: true,
      });
      controllerWidget.setContainer(controllerWidgetDiv);

      // setUpContent sets the size to the container.
      controllerWidget.setupContent(renderWindow, actor, true);
      fullScreenRenderer1.setResizeCallback(({ width, height }) => {
        controllerWidget.render();
      });
      isoWidget.style.display = "none";
      break;
    case "Volume Contour":
      isoWidget.style.display = "block";
      break;
  }
}

// Auto setup if no method get called within 100ms
setTimeout(() => {
  if (autoInit) {
    initLocalFileLoader();
  }
}, 100);
