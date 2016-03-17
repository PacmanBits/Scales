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