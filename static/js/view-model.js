
// var SimpleModelViewerWithControls = STK.SimpleModelViewerWithControls;

// var canvas = document.getElementById('canvas');
// var modelViewer = new SimpleModelViewerWithControls(canvas);
// modelViewer.redisplay();

// Make instructions tab toggleable
var featureChart;
var controls;
$(document).ready(function(){
	$('#images').on('shown.bs.collapse', function () {
	  modelViewer.modelImagesPanel.onResize();
	});
	$('#instructions').hide();
	$('#instructionsPanel').click(function () { $('#instructions').toggle(); });
	showModel("three-vtk/models/vtk/airplane.off", $("#canvas"));
    featureChart = refreshFeatureChart("featureChart", [], []); //特征可视化

    showModel("three-vtk/models/vtk/airplane.off", $("#canvas"));
    // controls.enabled = true;
    window.controls.enabled = true;
    $("#canvas canvas").css("margin-top", "60px");
});