
// var SimpleModelViewerWithControls = STK.SimpleModelViewerWithControls;

// var canvas = document.getElementById('canvas');
// var modelViewer = new SimpleModelViewerWithControls(canvas);
// modelViewer.redisplay();

// Make instructions tab toggleable
var featureChart;
$(document).ready(function(){
	$('#images').on('shown.bs.collapse', function () {
	  modelViewer.modelImagesPanel.onResize();
	});
	$('#instructions').hide();
	$('#instructionsPanel').click(function () { $('#instructions').toggle(); });
	showModel("three-vtk/models/vtk/airplane.off", $("#canvas"));
    featureChart = refreshFeatureChart("featureChart", [], []); //特征可视化
});


function showModel(modelPath, container) {

    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

    var camera, controls, scene, renderer;
    init();
    animate();

    function init() {

        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 1e10 );
        camera.position.z = 200;

        controls = new THREE.TrackballControls( camera );

        controls.rotateSpeed = 5.0;
        controls.zoomSpeed = 5;
        controls.panSpeed = 2;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;

        scene = new THREE.Scene();

        scene.add( camera );

        // light

        var dirLight = new THREE.DirectionalLight( 0xffffff );
        dirLight.position.set( 200, 200, 1000 ).normalize();

        camera.add( dirLight );
        camera.add( dirLight.target );

        var material = new THREE.MeshLambertMaterial( { color: 0xffffff, side: THREE.DoubleSide } );

        var loader = new THREE.VTKLoader();
//                    var offPath = "models/vtk/airplane.off";
		offPath = modelPath;
        loader.load( offPath, function ( geometry ) {
            geometry.center();
            geometry.computeVertexNormals();
            geometry.computeBoundingBox();
            var meshSize = geometry.boundingBox.size();
            console.log(meshSize, meshSize.x, meshSize.y, meshSize.z);
//                        var arr = [meshSize.x, meshSize.y, meshSize.z];
            var scalar = 1000 / Math.max(Math.max( meshSize.x, meshSize.y), meshSize.z);
            console.log(scalar);
            var mesh = new THREE.Mesh( geometry, material );


            mesh.position.set( - 0.075, 0.005, 0 );
            mesh.scale.multiplyScalar( 0.2 * scalar);
//                        mesh.scale.set(2,2,2);
            scene.add( mesh );

        } );

        // renderer

        renderer = new THREE.WebGLRenderer( { antialias: false, alpha: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
//                    renderer.setSize( window.innerWidth, window.innerHeight);
		renderer.setSize($("#canvas").width(), $("#canvas").height()-60);

        // container = document.createElement( 'div' );
//                    document.body.appendChild( container );
		// div2.appendChild( container);
        container.append( renderer.domElement );
        $("#canvas canvas").css("margin-top", "60px");

        window.addEventListener( 'resize', onWindowResize, false );

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

        controls.handleResize();

    }

    function animate() {

        requestAnimationFrame( animate );

        controls.update();
        renderer.render( scene, camera );

    }
}
