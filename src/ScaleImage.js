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