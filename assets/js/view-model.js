
// var SimpleModelViewerWithControls = STK.SimpleModelViewerWithControls;

// var canvas = document.getElementById('canvas');
// var modelViewer = new SimpleModelViewerWithControls(canvas);
// modelViewer.redisplay();
$('#images').on('shown.bs.collapse', function () {
  modelViewer.modelImagesPanel.onResize();
});
// Make instructions tab toggleable
$('#instructions').hide();
$('#instructionsPanel').click(function () { $('#instructions').toggle(); });
