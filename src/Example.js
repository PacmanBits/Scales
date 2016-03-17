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