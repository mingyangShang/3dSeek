
// var SimpleModelViewerWithControls = STK.SimpleModelViewerWithControls;
//
// var canvas = document.getElementById('canvas');
// var modelViewer = new SimpleModelViewerWithControls(canvas);
// modelViewer.redisplay();

// Make instructions tab toggleable
var featureChart;
var controls;
$(document).ready(function(){
	// $.getJSON('/viewer', function(resp, status){
	// 	if(status == "success"){
	// 		refreshModelInfo();
	// 	}
	// });
	$('#images').on('shown.bs.collapse', function () {
	  // modelViewer.modelImagesPanel.onResize();
	});
	$('#instructions').hide();
	$('#instructionsPanel').click(function () { $('#instructions').toggle(); });
	// showModel("{{/static/database/modelnet10/airplane.off}}", $("#canvas"));
	showModel("{{url_for('static', filename='airplane.off')}}", $("#canvas"));
    featureChart = refreshFeatureChart("featureChart", [], []); //特征可视化

    // showModel("three-vtk/models/vtk/airplane.off", $("#canvas"));
    // controls.enabled = true;
    window.controls.enabled = true;
    $("#canvas canvas").css("margin-top", "60px");
});

function refreshModelInfo(info){
	featureChart = refreshFeatureChart("featureChart", info.x, info.y);
	// featureChart
}