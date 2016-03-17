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
