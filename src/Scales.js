var ScaleImage = require("./ScaleImage");
var WebWorkify = require('WebWorkify');

var Scales = {};
Scales.diffFuncs = require("./DiffFunctions");

(function() {

	this.mergeImages = (function(imageA, imageB, mergeFunction) {
		if(typeof mergeFunction != "function")
			mergeFunction = this.diffFuncs.highlightOverlayDiff;

		var sImgA = new ScaleImage(imageA);
		var sImgB = new ScaleImage(imageB);

		var dimA = sImgA.getDimensions();
		var dimB = sImgB.getDimensions();

		var dim = {
			w: dimA.w > dimB.w ? dimB.w : dimA.w,
			h: dimA.h > dimB.h ? dimB.h : dimA.h
		};

		var out = makeScaleImage(dim.w, dim.h);

		for(var x = 0; x < dim.w; x++) {
			for(var y = 0; y < dim.h; y++) {
				var diff = mergeFunction(sImgA.getPixel(x, y), sImgB.getPixel(x, y));
				diff.a = 255;
				out.setPixel(x, y, diff);
			}
		}

		return out.getImage();
	}).bind(this);

	this.mergeImagesAsync = (function(imageA, imageB, mergeFunction) {
		if(typeof mergeFunction != "string")
			mergeFunction = "highlightOverlayDiff";
		
		var worker = WebWorkify(require("./ScalesWorker"));

		var sImgA = new ScaleImage(imageA);
		var sImgB = new ScaleImage(imageB);

		var dataA = sImgA.getImageData();
		var dataB = sImgB.getImageData();

		var dimA = sImgA.getDimensions();
		var dimB = sImgB.getDimensions();

		var dim = {
			w: dimA.w > dimB.w ? dimB.w : dimA.w,
			h: dimA.h > dimB.h ? dimB.h : dimA.h
		};

		var out = ScaleImage.makeBlank(dim.w, dim.h);


		var callbacks = {
			complete: [],
			progress: []
		};

		var chain;
		chain = {
			progress: function(callback) {
				callbacks.progress.push(callback);
				return chain;
			},
			complete: function(callback) {
				callbacks.complete.push(callback);
				return chain;
			}
		};

		function callCallbacks(callback, arg) {
			for(var c = 0; c < callbacks[callback].length; c++) {
				callbacks[callback][c].call(this, arg);
			}
		}


		worker.addEventListener("message", function (e) {
			switch(e.data.type) {
				case "complete":
					out.setImageData(e.data.data);
					callCallbacks("complete", out.getImage());
					break;
				case "progress":
					callCallbacks("progress", e.data.data * 100);
					break;
			}
		});

		worker.postMessage({
			type: "start",
			data: {
				dim: dim,
				dataA: dataA,
				dataB: dataB,
				mergeFunction
			}
		});

		return chain;
	}).bind(this);
}).call(Scales);

module.exports = Scales;