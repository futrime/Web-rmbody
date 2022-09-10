/*
 * @license
 * Modifications copyright 2020 Zijian Zhang.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 *
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const DEBUG = false;

// The URL at which the models are located
// 	e.g 'https://storage.googleapis.com/tfjs-models/savedmodel/bodypix'
// If you use ./model-downloader.py to download models,
// 	you might need to modified the URL below to './model-downloader/bodypix'
const MODEL_BASE_URL = 'https://storage.googleapis.com/tfjs-models/savedmodel/bodypix'

// An object to configure parameters to set for the bodypix model.
// See github docs of tfjs-models for explanations.
// All the four (For ResNet50 is three) parameters ARE REQUIRED!!!
const bodyPixProperties = {
	// Either 'MobileNetV1'(Faster, Slimmer but less accurate and poorer quality)
	// 	or 'ResNet50'(More accurate, better quality but slower and larger)
	architecture: 'MobileNetV1',
	// Either 8 or 16 for MobileNet; 16 or 32 for ResNet50.
	// The larger the less accurate but faster and slimmer.
	outputStride: 16,
	// Just for MobileNet. Either 0.50, 0.75 or 1.00.
	// The smaller the less accurate but faster and slimmer.
	multiplier: 0.75,
	// Either 1, 2 or 4. The smaller the slimmer but less accurate
	quantBytes: 2
};

// An object to configure parameters for detection. I have raised
// the segmentation threshold to 90% confidence to reduce the
// number of false positives.
const segmentationProperties = {
    flipHorizontal: false,
    // The resolution for model to recognize your bodyPix.
    // 'medium' = 50%, 'high' = '75%', 'full' = 100%, The higher the better but slower.
    // e.g. 'medium' with a 1080p camera(1920x1080) will be set to 960x540.
    internalResolution: 'medium',
    segmentationThreshold: 0.5,
    scoreThreshold: 0.2
};


// Render returned segmentation data to a given canvas context.
function processSegmentation(canvas, segmentation) {
	var ctx = canvas.getContext('2d');
	console.log(segmentation)
	// Get data from our overlay canvas which is attempting to estimate background.
	var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	var data = imageData.data;
	// Get data from the live webcam view which has all data.
	var liveData = videoRenderCanvasCtx.getImageData(0, 0, canvas.width, canvas.height);
	var dataL = liveData.data;

	var minX = 100000, minY = 100000, maxX = 0, maxY = 0;
	var foundBody = false;

	// Go through pixels and figure out bounding box of body pixels.
	for (let x = 0; x < canvas.width; x++) {
		for (let y = 0; y < canvas.height; y++) {
			let n = y * canvas.width + x;
			// Human pixel found. Update bounds.
			if (segmentation.data[n] !== -1) {
				if(x < minX) minX = x;
				if(y < minY) minY = y;
				if(x > maxX) maxX = x;
				if(y > maxY) maxY = y;
				foundBody = true;
			}
		}
	}

	// Calculate dimensions of bounding box.
	var width = maxX - minX, height = maxY - minY;
	// Define scale factor to use to allow for false negatives around this region.
	var scale = 1.3;
	// Define scaled dimensions.
	var newWidth = width * scale, newHeight = height * scale;
	// Caculate the offset to place new bounding box so scaled from center of current bounding box.
	var offsetX = (newWidth - width) / 2, offsetY = (newHeight - height) / 2;
	var newXMin = minX - offsetX, newYMin = minY - offsetY;

	// Now loop through update backgound understanding with new data
	// if not inside a bounding box.
	for (let x = 0; x < canvas.width; x++) {
		for (let y = 0; y < canvas.height; y++) {
			// If outside bounding box and we found a body, update background.
			if (foundBody && (x < newXMin || x > newXMin + newWidth) || ( y < newYMin || y > newYMin + newHeight)) {
				// Convert xy co-ords to array offset.
				let n = y * canvas.width + x;
				data[n * 4] = dataL[n * 4];
				data[n * 4 + 1] = dataL[n * 4 + 1];
				data[n * 4 + 2] = dataL[n * 4 + 2];
				data[n * 4 + 3] = 255;
			} else if (!foundBody) {
				// No body found at all, update all pixels.
				let n = y * canvas.width + x;
				data[n * 4] = dataL[n * 4];
				data[n * 4 + 1] = dataL[n * 4 + 1];
				data[n * 4 + 2] = dataL[n * 4 + 2];
				data[n * 4 + 3] = 255;
			}
		}
	}

	ctx.putImageData(imageData, 0, 0);

	if (DEBUG) {
		ctx.strokeStyle = "#00FF00"
		ctx.beginPath();
		ctx.rect(newXMin, newYMin, newWidth, newHeight);
		ctx.stroke();
	}
}

// Which bodyparts to display. Please see https://github.com/tensorflow/tfjs-models/blob/master/body-pix/README.md#the-body-parts
const bodypart = [0, 1];
function processBodypart(canvas, bgcanvas, segmentation) {
	var ctx = canvas.getContext('2d');
	console.log(segmentation)
	// Get data from our overlay canvas which is attempting to estimate background.
	var imageData = bgcanvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
	var data = imageData.data;
	// Get data from the live webcam view which has all data.
	var liveData = videoRenderCanvasCtx.getImageData(0, 0, canvas.width, canvas.height);
	var dataL = liveData.data;

	var minX = 100000, minY = 100000, maxX = 0, maxY = 0;
	var foundBody = false;

	// Go through pixels and figure out bounding box of body pixels.
	for (let x = 0; x < canvas.width; x++) {
		for (let y = 0; y < canvas.height; y++) {
			let n = y * canvas.width + x;
			// Human pixel found. Update bounds.
			if (bodypart.indexOf(segmentation.data[n]) != -1) {
				if(x < minX) minX = x;
				if(y < minY) minY = y;
				if(x > maxX) maxX = x;
				if(y > maxY) maxY = y;
				foundBody = true;
			}
		}
	}

	// Calculate dimensions of bounding box.
	var width = maxX - minX, height = maxY - minY;
	// Define scale factor to use to allow for false negatives around this region.
	var scale = 1.1;
	// Define scaled dimensions.
	var newWidth = width * scale, newHeight = height * scale;
	// Caculate the offset to place new bounding box so scaled from center of current bounding box.
	var offsetX = (newWidth - width) / 2, offsetY = (newHeight - height) / 2;
	var newXMin = minX - offsetX, newYMin = minY - offsetY;

	// Now loop through update backgound understanding with new data
	// if not inside a bounding box.
	for (let x = 0; x < canvas.width; x++) {
		for (let y = 0; y < canvas.height; y++) {
			// If outside bounding box and we found a body, update background.
			if (foundBody && (x >= newXMin && x <= newXMin + newWidth) && ( y >= newYMin && y <= newYMin + newHeight)) {
				// Convert xy co-ords to array offset.
				let n = y * canvas.width + x;
				data[n * 4] = dataL[n * 4];
				data[n * 4 + 1] = dataL[n * 4 + 1];
				data[n * 4 + 2] = dataL[n * 4 + 2];
				data[n * 4 + 3] = 255;
            }
		}
	}

	ctx.putImageData(imageData, 0, 0);

	if (DEBUG) {
		ctx.strokeStyle = "#00FF00"
		ctx.beginPath();
		ctx.rect(newXMin, newYMin, newWidth, newHeight);
		ctx.stroke();
	}
}


// Let's load the model with our parameters defined above.
// Before we can use bodypix class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
var modelHasLoaded = false;
var model = undefined;

// Parse the BodyPixProperties
function getBodyPixModelUrl(config){
	const config_url = {
		architecture: {
			'MobileNetV1': '/mobilenet',
			'ResNet50': '/resnet50'
		},
		outputStride: {
			8: '/model-stride8.json',
			16: '/model-stride16.json',
			32: '/model-stride32.json',
		},
		multiplier: {
			1.0: '/100',
			0.75: '/075',
			0.5: '/050'
		},
		quantBytes: {
			4: '/float',
			2: '/quant2',
			1: '/quant1'
		}
	};
	let multiplier = (config['architecture'] == 'MobileNetV1')?
		config_url['multiplier'][config['multiplier']]: '';
	let url = MODEL_BASE_URL + config_url['architecture'][config['architecture']];
	url += config_url['quantBytes'][config['quantBytes']];
	url += multiplier;
	url += config_url['outputStride'][config['outputStride']];
	return url;
}

let bodyPixModelUrl = getBodyPixModelUrl(bodyPixProperties);

bodyPix.load({modelUrl: bodyPixModelUrl}).then(function (loadedModel) {
    model = loadedModel;
    modelHasLoaded = true;
    // Show demo section now model is ready to use.
    demosSection.classList.remove('invisible');
});


/********************************************************************
// Continuously grab image from webcam stream and classify it.
********************************************************************/

var previousSegmentationComplete = true;

// Check if webcam access is supported.
function hasGetUserMedia() {
    return !!(navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia);
}


// This function will repeatidly call itself when the browser is ready to process
// the next frame from webcam.
let fps_last_time = new Date().getTime();
let fps_count = 0;
function predictWebcam() {
	if (previousSegmentationComplete) {
		// Copy the video frame from webcam to a tempory canvas in memory only (not in the DOM).
		videoRenderCanvasCtx.drawImage(video, 0, 0);
		previousSegmentationComplete = false;
        // Now classify the canvas image we have available.
		model.segmentPersonParts(videoRenderCanvas, segmentationProperties)
			.then(function(segmentation) {
			processSegmentation(webcamCanvas, segmentation);
            processBodypart(bodypartCanvas, webcamCanvas, segmentation);
			previousSegmentationComplete = true;
		});
	}

	// Display the frame rate
	if(++fps_count == 10){
		fps_count = 0;
		let fps_now_time = new Date().getTime()
		$("#fps").text("Frame Rate: " + (10.0 / (fps_now_time - fps_last_time) * 1000).toFixed(2) + " FPS");
		fps_last_time = fps_now_time;
	}

	// Call this function again to keep predicting when the browser is ready.
	window.requestAnimationFrame(predictWebcam);
}


// Enable the live webcam view and start classification.
function enableCam(event) {
    if (!modelHasLoaded) {
        return;
    }

    // Hide the button.
    event.target.classList.add('invisible');

    // getUsermedia parameters.
    const constraints = {
        video: true
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        video.addEventListener('loadedmetadata', function() {
            // Update widths and heights once video is successfully played otherwise
            // it will have width and height of zero initially causing classification
            // to fail.
            webcamCanvas.width = video.videoWidth;
            webcamCanvas.height = video.videoHeight;
            bodypartCanvas.width = video.videoWidth;
            bodypartCanvas.height = video.videoHeight;
            videoRenderCanvas.width = video.videoWidth;
            videoRenderCanvas.height = video.videoHeight;
            let webcamCanvasCtx = webcamCanvas.getContext('2d');
            webcamCanvasCtx.drawImage(video, 0, 0);
            let bodypartCanvasCtx = bodypartCanvas.getContext('2d');
            bodypartCanvasCtx.drawImage(video, 0, 0);
        });

        video.srcObject = stream;

        video.addEventListener('loadeddata', predictWebcam);
    });
}


// We will create a tempory canvas to render to store frames from
// the web cam stream for classification.
var videoRenderCanvas = document.createElement('canvas');
var videoRenderCanvasCtx = videoRenderCanvas.getContext('2d');

// Lets create a canvas to render our findings to the DOM.
var webcamCanvas = document.createElement('canvas');
webcamCanvas.setAttribute('class', 'overlay w-100 mh-100');
liveView.appendChild(webcamCanvas);

// Create a canvas to render body parts to the DOM.
var bodypartCanvas = document.createElement('canvas');
bodypartCanvas.setAttribute('class', 'overlay w-100 mh-100');
liveView.appendChild(bodypartCanvas);

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
    const enableWebcamButton = document.getElementById('webcamButton');
    enableWebcamButton.addEventListener('click', enableCam);
} else {
    console.warn('getUserMedia() is not supported by your browser');
}
