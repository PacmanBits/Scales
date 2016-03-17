(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

var stringify = JSON.stringify;

module.exports = function (fn) {
    var keys = [];
    var wkey;
    var cacheKeys = Object.keys(cache);

    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        var exp = cache[key].exports;
        // Using babel as a transpiler to use esmodule, the export will always
        // be an object with the default export as a property of it. To ensure
        // the existing api and babel esmodule exports are both supported we
        // check for both
        if (exp === fn || exp.default === fn) {
            wkey = key;
            break;
        }
    }

    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            Function(['require','module','exports'], '(' + fn + ')(self)'),
            wcache
        ];
    }
    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);

    var scache = {}; scache[wkey] = wkey;
    sources[skey] = [
        Function(['require'], (
            // try to call default if defined to also support babel esmodule
            // exports
            'var f = require(' + stringify(wkey) + ');' +
            '(f.default ? f.default : f)(self);'
        )),
        scache
    ];

    var src = '(' + bundleFn + ')({'
        + Object.keys(sources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(skey) + '])'
    ;

    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    return new Worker(URL.createObjectURL(
        new Blob([src], { type: 'text/javascript' })
    ));
};

},{}],2:[function(require,module,exports){
var diffFuncs = {};

(function() {
	this.diff = function(colorA, colorB) {
		return {
			r: abs(colorA.r - colorB.r),
			g: abs(colorA.g - colorB.g),
			b: abs(colorA.b - colorB.b),
			a: abs(colorA.a - colorB.a)
		};
	}

	this.diffNoTransparent = function(colorA, colorB) {
		return {
			r: abs(colorA.r - colorB.r),
			g: abs(colorA.g - colorB.g),
			b: abs(colorA.b - colorB.b),
			a: 255
		};
	}

	this.highlightDiff = function(colorA, colorB) {
		if(colorsEqual(colorA, colorB))
			return { r: 0, g: 0, b: 0, a: 255 };
		else
			return { r: 255, g: 0, b: 255, a: 255 };
	}

	this.highlightOverlayDiff = function(colorA, colorB) {
		if(colorsEqual(colorA, colorB))
			return colorA;
		else
			return { r: 255, g: 0, b: 255, a: 255 };
	}

	function colorsEqual(colorA, colorB) {
		return colorA.r === colorB.r &&
		       colorA.g === colorB.g &&
		       colorA.b === colorB.b &&
		       colorA.a === colorB.a;
	}

	function abs(num) {
		if(num < 0)
			num = -num;

		return num;
	}
}).call(diffFuncs);

module.exports = diffFuncs;

},{}],3:[function(require,module,exports){
var Scales = require("./Scales")

window.onload = function() {
	var imgA = document.getElementById("imgA");
	var imgB = document.getElementById("imgB");

	var lastProg = 0;

	image = Scales.mergeImagesAsync(imgA, imgB)
		.complete(function(img) {
			document.getElementById("OutImage").appendChild(img);
		})
		.progress(function(prog) {
			var perc = prog * 100;

			if(perc - lastProg > 10) {
				lastProg = perc;
				console.log(Math.round(perc) + "%");
			}
		});
};
},{"./Scales":5}],4:[function(require,module,exports){
function getCanvasFromImage(image) {
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");

	canvas.width = image.width;
	canvas.height = image.height;

	context.drawImage(image, 0, 0, image.width, image.height);

	return canvas;
}

function getImageFromCanvas(canvas) {
	var image = new Image();
	image.src = canvas.toDataURL("image/png");
	return image;
}

function ScaleImage(img) {
	
	var canvas = getCanvasFromImage(img);
	var context = canvas.getContext("2d");
	var imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;

	var pixel = context.createImageData(1,1);
	var pData = pixel.data;

	this.getPixel = function(x, y) {
		var index = (x + y * canvas.width) * 4;

		return {
			r: imageData[index],
			g: imageData[index + 1],
			b: imageData[index + 2],
			a: imageData[index + 3]
		};
	};

	this.setPixel = function(x, y, color) {
		pData[0] = color.r;
		pData[1] = color.g;
		pData[2] = color.b;
		pData[3] = color.a;

		context.putImageData(pixel, x, y); 
	};

	this.getWidth = function() {
		return canvas.width;
	};

	this.getHeight = function() {
		return canvas.height;
	};

	this.getDimensions = (function() {
		return {
			w: this.getWidth(),
			h: this.getHeight()
		};
	}).bind(this);

	this.getCanvas = function() {
		return canvas;
	};

	this.getContext = function() {
		return context;
	};

	this.getImage = function() {
		return getImageFromCanvas(canvas);
	};

	this.getImageData = function() {
		return imageData;
	};

	this.setImageData = function(data) {
		var typedArray = new Uint8ClampedArray(data);
		var imageData = new ImageData(typedArray, canvas.width, canvas.height);
		context.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height); 
	};
}

ScaleImage.makeBlank = function(width, height) {
	return new ScaleImage(new Image(width, height));
}

module.exports = ScaleImage;
},{}],5:[function(require,module,exports){
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
},{"./DiffFunctions":2,"./ScaleImage":4,"./ScalesWorker":6,"WebWorkify":1}],6:[function(require,module,exports){
var diffFuncs = require("./DiffFunctions");

module.exports = function (self) {
	self.addEventListener('message', function(e) {
		var dim = e.data.data.dim;
		var dataA = e.data.data.dataA;
		var dataB = e.data.data.dataB;
		var mergeFunction = diffFuncs[e.data.data.mergeFunction];

		var imageData = [];

		var total = dim.w * dim.h;
		var inc = 0;

		for(var y = 0; y < dim.h; y++) {
			for(var x = 0; x < dim.w; x++) {
				var diff = mergeFunction(
					getPixel(dataA, x, y, dim.w),
					getPixel(dataB, x, y, dim.w)
				);

				//console.log(diff);

				imageData.push(diff.r);
				imageData.push(diff.g);
				imageData.push(diff.b);
				imageData.push(diff.a);

				inc++;
			}
			// Only update once per row
			postMessage({ type: "progress", data: (inc / total) });
		}

		postMessage({ type: "complete", data: imageData });
	});
};

function getPixel(imageData, x, y, width) {
	var index = (x + y * width) * 4;

	return {
		r: imageData[index],
		g: imageData[index + 1],
		b: imageData[index + 2],
		a: imageData[index + 3]
	};
}
},{"./DiffFunctions":2}]},{},[3]);
