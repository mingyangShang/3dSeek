
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
	// showModel('/static/bathtub_0007.off', $("#canvas"));
    featureChart = refreshFeatureChart("featureChart", [], []); //特征可视化

    // controls.enabled = true;
    window.controls.enabled = true;
    $("#canvas canvas").css("margin-top", "60px");
});

function refreshModelInfo(info){
	featureChart = refreshFeatureChart("featureChart", info.x, info.y);
	// featureChart
}