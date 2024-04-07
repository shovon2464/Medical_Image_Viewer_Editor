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

//import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';

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

//Slicer functiom

function setupMultiSlice({ renderer2, renderWindow2, source: data }) {
  //initializing slices 
  const imageActorI = vtkImageSlice.newInstance();
  const imageActorJ = vtkImageSlice.newInstance();
  const imageActorK = vtkImageSlice.newInstance();

  //adding actors to the slices
  renderer2.addActor(imageActorK);
  renderer2.addActor(imageActorJ);
  renderer2.addActor(imageActorI);

  //function to update color level
  function updateColorLevel(e) {
    const colorLevel = Number(
      (e ? e.target : document.querySelector(".colorLevel")).value
    );
    //setting color level property
    imageActorI.getProperty().setColorLevel(colorLevel);
    imageActorJ.getProperty().setColorLevel(colorLevel);
    imageActorK.getProperty().setColorLevel(colorLevel);
    renderWindow2.render();
  }
   //function to update color window
  function updateColorWindow(e) {
    const colorLevel = Number(
      (e ? e.target : document.querySelector(".colorWindow")).value
    );
    //setting color window property
    imageActorI.getProperty().setColorWindow(colorLevel);
    imageActorJ.getProperty().setColorWindow(colorLevel);
    imageActorK.getProperty().setColorWindow(colorLevel);
    renderWindow2.render();
  }

  //-------------------------------
  //initializing mapper and setting input data, slice values and mappers
  const imageMapperK = vtkImageMapper.newInstance();
  imageMapperK.setInputData(data);
  imageMapperK.setKSlice(30);
  imageActorK.setMapper(imageMapperK);

  const imageMapperJ = vtkImageMapper.newInstance();
  imageMapperJ.setInputData(data);
  imageMapperJ.setJSlice(30);
  imageActorJ.setMapper(imageMapperJ);

  const imageMapperI = vtkImageMapper.newInstance();
  imageMapperI.setInputData(data);
  imageMapperI.setISlice(30);
  imageActorI.setMapper(imageMapperI); 

  //if the range of slicees are changed in the control panel input 
  //then the value of slices will be updated in the window also
  document.querySelector(".sliceI").addEventListener("input", (e) => {
    imageActorI.getMapper().setISlice(Number(e.target.value));
    renderWindow2.render();
  });

  document.querySelector(".sliceJ").addEventListener("input", (e) => {
    imageActorJ.getMapper().setJSlice(Number(e.target.value));
    renderWindow2.render();
  });

  document.querySelector(".sliceK").addEventListener("input", (e) => {
    imageActorK.getMapper().setKSlice(Number(e.target.value));
    renderWindow2.render();
  });

  //get the data range
  const dataRange = data.getPointData().getScalars().getRange();
  const extent = data.getExtent();

  //setting attribute for values from control panel input 
  [".sliceI", ".sliceJ", ".sliceK"].forEach((selector, idx) => {
    const el = document.querySelector(selector);
    el.setAttribute("min", extent[idx * 2 + 0]);
    el.setAttribute("max", extent[idx * 2 + 1]);
    el.setAttribute("value", 30);
  });
   //setting attribute for values from control panel input
  [".colorLevel", ".colorWindow"].forEach((selector) => {
    document.querySelector(selector).setAttribute("max", dataRange[1]);
    document.querySelector(selector).setAttribute("value", dataRange[1]);
  });
  document
    .querySelector(".colorLevel")
    .setAttribute("value", (dataRange[0] + dataRange[1]) / 2);
  updateColorLevel();
  updateColorWindow();
  //if color level is changed then call updateColorLevel function
  document
    .querySelector(".colorLevel")
    .addEventListener("input", updateColorLevel);
  document
    .querySelector(".colorWindow")
    .addEventListener("input", updateColorWindow);

  //making the slices global
  global.imageActorI = imageActorI;
  global.imageActorJ = imageActorJ;
  global.imageActorK = imageActorK; 

 
  renderer2.resetCamera();
  renderWindow2.render();
}

//end of setupmultislice


// cropper function
function setupCropper({renderer3,renderWindow3}){
  //setting up control panel
  function setupControlPanel(data, cropFilter) {
    const axes = ['I', 'J', 'K'];
    const minmax = ['min', 'max'];
  
    const extent = data.getExtent();
    //setting the attributes with the change of inputs from the control panel
    axes.forEach((ax, axi) => {
      minmax.forEach((m, mi) => {
        const el = document.querySelector(`.${ax}${m}`);
        el.setAttribute('min', extent[axi * 2]);
        el.setAttribute('max', extent[axi * 2 + 1]);
        el.setAttribute('value', extent[axi * 2 + mi]);
  
        el.addEventListener('input', () => {
          const planes = cropFilter.getCroppingPlanes().slice();
          planes[axi * 2 + mi] = Number(el.value);
          cropFilter.setCroppingPlanes(...planes);          
          renderWindow3.render();
        });
      });
    });
  }
  
  // creating filter
  const cropFilter = vtkImageCropFilter.newInstance();  
  const reader = vtkHttpDataSetReader.newInstance({ fetchGzip: true }); 
  //creating pipeline 
  const actor = vtkVolume.newInstance();
  const mapper = vtkVolumeMapper.newInstance();
  mapper.setSampleDistance(1.1);
  actor.setMapper(mapper);
  
  // create color and opacity transfer functions
  const ctfun = vtkColorTransferFunction.newInstance();
  ctfun.addRGBPoint(0, 85 / 255.0, 0, 0);
  ctfun.addRGBPoint(95, 1.0, 1.0, 1.0);
  ctfun.addRGBPoint(225, 0.66, 0.66, 0.5);
  ctfun.addRGBPoint(255, 0.3, 1.0, 0.5);
  const ofun = vtkPiecewiseFunction.newInstance();
  ofun.addPoint(0.0, 0.0);
  ofun.addPoint(255.0, 1.0);
  actor.getProperty().setRGBTransferFunction(0, ctfun);
  actor.getProperty().setScalarOpacity(0, ofun);
  actor.getProperty().setScalarOpacityUnitDistance(0, 3.0);
  actor.getProperty().setInterpolationTypeToLinear();
  actor.getProperty().setUseGradientOpacity(0, true);
  actor.getProperty().setGradientOpacityMinimumValue(0, 2);
  actor.getProperty().setGradientOpacityMinimumOpacity(0, 0.0);
  actor.getProperty().setGradientOpacityMaximumValue(0, 20);
  actor.getProperty().setGradientOpacityMaximumOpacity(0, 1.0);
  actor.getProperty().setShade(true);
  actor.getProperty().setAmbient(0.2);
  actor.getProperty().setDiffuse(0.7);
  actor.getProperty().setSpecular(0.3);
  actor.getProperty().setSpecularPower(8.0);
  
  //reading the data
  reader.setUrl(`https://kitware.github.io/vtk-js/data/volume/headsq.vti`).then(() => {
    reader.loadData().then(() => {
      renderer3.addVolume(actor);
  
      const data = reader.getOutputData();

      //set up crop planes
      cropFilter.setCroppingPlanes(...data.getExtent());

      //calling setupControlPanel function
      setupControlPanel(data, cropFilter);
      
      //set up interactor, camera and renderwindow
      const interactor = renderWindow3.getInteractor();
      interactor.setDesiredUpdateRate(15.0);
      renderer3.resetCamera();
      renderWindow3.render();
      
    });
  });

  //set up input connection
  cropFilter.setInputConnection(reader.getOutputPort());
  mapper.setInputConnection(cropFilter.getOutputPort());  

  //making the variables global
  global.source = reader;
  global.mapper = mapper;
  global.actor = actor;
  global.ctfun = ctfun;
  global.ofun = ofun;
  global.renderer = renderer3;
  global.renderWindow = renderWindow3;
  global.cropFilter = cropFilter;
}

//Volume Contour function


//end of cropper
//-----------------------------------------------------------------------------

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
