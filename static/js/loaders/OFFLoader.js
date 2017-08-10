/**
 * @author mrdoob / http://mrdoob.com/
 * @author Alex Pletzer
 * 
 * Updated on 22.03.2017
 * VTK header is now parsed and used to extract all the compressed data
 * @author Andrii Iudin https://github.com/andreyyudin
 * @author Paul Kibet Korir https://github.com/polarise
 * @author Sriram Somasundharam https://github.com/raamssundar
 */

THREE.OFFLoader = function( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

Object.assign( THREE.OFFLoader.prototype, THREE.EventDispatcher.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	parse: function ( data ) {
		function parseOFF(data) {
            var indices = [];
            // triangles vertices
            var positions = [];
            var normals = [];
            var result;
            // pattern for reading vertices, 3 floats or integers
            var lines = data.split( '\n' );
            var isStart = false;
            var np = 0;
            var nf = 0;
            var pc = 0;

            for (var i = 0;i < lines.length; i++){
                var line = lines[ i ];
                if (isStart){
                    var inds = lines[i].split( /\s+/ );
                    if (inds.length == 3){
                        var x = parseFloat( inds[ 0 ] );
                        var y = parseFloat( inds[ 1 ] );
                        var z = parseFloat( inds[ 2 ] );
                        positions.push( x, y, z );
					}else if(inds.length >= 4){
                        var i0 = parseInt( inds[ 1 ] );
                        var i1 = parseInt( inds[ 2 ] );
                        var i2 = parseInt( inds[ 3 ] );
                        indices.push( i0, i1, i2 );
					}

				}
                if (!isStart && line.toLowerCase().indexOf('off') != -1){
                    isStart = true;
                    i++;
                    var inds = lines[i].split( /\s+/ );
                    np = parseInt(inds[0]);
					nf = parseInt(inds[1]);
                }

			}
            geometry = new THREE.BufferGeometry();
            geometry.setIndex( new THREE.BufferAttribute( new Uint32Array( indices ), 1 ) );
            geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( positions ), 3 ) );
            return geometry;
        }

		function Float32Concat(first, second) {
		    var firstLength = first.length,
		        result = new Float32Array(firstLength + second.length);

		    result.set(first);
		    result.set(second, firstLength);

		    return result;
		}

		function Int32Concat(first, second) {
		    var firstLength = first.length,
		        result = new Int32Array(firstLength + second.length);

		    result.set(first);
		    result.set(second, firstLength);

		    return result;
		}


		function getStringFile( data ) {

			var stringFile = '';
			var charArray = new Uint8Array( data );
			var i = 0;
			var len = charArray.length;

			while ( len -- ) {

				stringFile += String.fromCharCode( charArray[ i ++ ] );

			}

			return stringFile;

		}

        return parseOFF( getStringFile( data ) );

	}

} );
