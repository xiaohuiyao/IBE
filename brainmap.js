var r
		window.onload = function() {

			// create and initialize a 3D renderer
			r = new X.renderer3D();
			r.container = 'vis3d';
			r.init();
			
			var vr = false;
			var gr = false;
			//var gui = new dat.GUI();
			//var volumegui;
			//var labelmapgui;
			
			var volume = new X.volume();
			// .. and attach the single-file dicom in .NRRD format
			// this works with gzip/gz/raw encoded NRRD files but XTK also supports other
			// formats like MGH/MGZ
			volume.file = 'vtk/volume.mgz';
			//volume.file = 'vtk/1123_N3.nii.gz';
			// we also attach a label map to show segmentations on a slice-by-slice base
			volume.labelmap.file = 'vtk/label.mgz';
			// .. and use a color table to map the label map values to colors
			volume.labelmap.colortable.file = 'vtk/LUT_2.txt';
			//v.opacity = 0.5;			
			r.interactor.onKey = function(event) {

   				if (event.keyCode == 86) {
     			vr = true;
     			vRender();
    			}
				/*else if (event.keyCode == 85) {
     			//vr = true;
     			//vRender();
    			r.remove(volume);
					volume = new X.volume();
					volume.file = 'vtk/volume.mgz';
					volume.labelmap.file = 'vtk/label.mgz';
					volume.labelmap.colortable.file = 'vtk/label_color_table_01.txt';

					r.add(volume);
					r.camera.position = [0, 400, 0];     		 
					r.render();
				}*/
 			};

			function vRender() {
    			if (vr) {
					//remove the former GUI
					//gui.remove(volumegui);
					//gui.remove(labelmapgui);
					//gui.destroy();
					//var gui = new dat.GUI();
					r.remove(volume);
					volume = new X.volume();
					volume.file = 'vtk/volume.mgz';
					volume.labelmap.file = 'vtk/label.mgz';
					volume.labelmap.colortable.file = 'vtk/label_color_table_01.txt';
					volume.labelmap.opacity = 0.5;
					r.add(volume);
					r.camera.position = [0, 400, 0];     		 
					r.render();
					//r.onShowtime = function(){};
   			 	}
  			}		
			
			
			/*r.onShowtime = function() {

			    //
			    // The GUI panel
			    //
			    // (we need to create this during onShowtime(..) since we do not know the
			    // volume dimensions before the loading was completed)
					var gui = new dat.GUI();

					// the following configures the gui for interacting with the X.volume
					var volumegui = gui.addFolder('Volume');
					//volumegui = gui.addFolder('Volume');
					// now we can configure controllers which..
					// .. switch between slicing and volume rendering
					var vrController = volumegui.add(volume, 'volumeRendering');
					// .. configure the volume rendering opacity
					var opacityController = volumegui.add(volume, 'opacity', 0, 1).listen();
					// .. and the threshold in the min..max range
					var lowerThresholdController = volumegui.add(volume, 'lowerThreshold',
						volume.min, volume.max);
					var upperThresholdController = volumegui.add(volume, 'upperThreshold',
						volume.min, volume.max);
					// the indexX,Y,Z are the currently displayed slice indices in the range
					// 0..dimensions-1
					var sliceXController = volumegui.add(volume, 'indexX', 0,
						volume.range[0] - 1);
					var sliceYController = volumegui.add(volume, 'indexY', 0,
					volume.range[1] - 1);
					var sliceZController = volumegui.add(volume, 'indexZ', 0,
					volume.range[2] - 1);
					volumegui.open();
		
					// and this configures the gui for interacting with the label map overlay
					var labelmapgui = gui.addFolder('Label Map');
					//labelmapgui = gui.addFolder('Label Map');
					var labelMapVisibleController = labelmapgui.add(volume.labelmap, 'visible');
					var labelMapOpacityController = labelmapgui.add(volume.labelmap, 'opacity', 0, 1);
					labelmapgui.open();
					
					//gui.destroy();
			  };*/
			

			// add the volume
			r.add(volume);
			
			// re-position the camera
			r.camera.position = [0, 400, 0];
			
			/////////////////////////////////////////////////////////////////////
			r.render();
			 //console.log(volume.labelmap.colortable)


		};