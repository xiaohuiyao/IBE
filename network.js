var w = 800,
h = 400,
rx = w / 2,
ry = h / 2,
m0,
rotate = 0;

//brain mapping event
bpidx = 0;

var r;
var vr;
var volume;



window.onload = function() {



	// create and initialize a 3D renderer
	r = new X.renderer3D();
	r.container = 'vis3d';
	r.init();
	vr=0;
	//var vr = false;
	//var gr = false;
	//var gui = new dat.GUI();
	//var volumegui;
	//var labelmapgui;
	
	volume = new X.volume();
	// .. and attach the single-file dicom in .NRRD format
	// this works with gzip/gz/raw encoded NRRD files but XTK also supports other
	// formats like MGH/MGZ
	volume.file = 'vtk/volume.mgz';
	//volume.file = 'vtk/1123_N3.nii.gz';
	// we also attach a label map to show segmentations on a slice-by-slice base
	volume.labelmap.file = 'vtk/label.mgz';
	// .. and use a color table to map the label map values to colors
	volume.labelmap.colortable.file = 'vtk/LUT_1.txt';
		
	 r.interactor.onKey = function(event) {
		if (event.keyCode == 86) {
		 vr = true;
		 vRender();
		 }
	 };

	function vRender() {
		if (vr=0) {
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

var splines = [];

var cluster = d3.layout.cluster()
.size([360, ry*.5])
.sort(function(a, b) { return d3.ascending(a.key, b.key); });

var bundle = d3.layout.bundle();

var line = d3.svg.line.radial()
.interpolate("bundle")
.tension(.85)
.radius(function(d) { return d.y; })
.angle(function(d) { return d.x / 180 * Math.PI; });

var colorScale = d3.scale.linear().domain([-1,0,1]).range(['#000080', '#98FB98', '#B0171F']);

// Chrome 15 bug: <http://code.google.com/p/chromium/issues/detail?id=98951>
var div = d3.select("body").insert("div")
.style("top", "30px")
.style("left", "200px")
.style("width", w + "px")
.style("height", w+ "px")
.style("position", "absolute")
.style("-webkit-backface-visibility", "hidden");

var svg = div.append("svg:svg")
.attr("width", w)
.attr("height", w)
.append("svg:g")
.attr("transform", "translate(" + rx + "," + ry + ")");

svg.append("svg:path")
.attr("class", "arc")
.attr("d", d3.svg.arc().outerRadius(ry*.5).innerRadius(0).startAngle(0).endAngle(2 * Math.PI))
.on("mousedown", mousedown);

d3.json("brain_network_bp.json", function(classes) {
	var nodes = cluster.nodes(packages.root(classes)),
	links = packages.imports(nodes),
	splines = bundle(links),
	max_degree = d3.max(nodes, function(d){return d.degree;}),
	max_w = d3.max(nodes, function(d){return d.weight;});

	d3.select("#degreeInput").attr("max",max_degree).attr("value",max_degree);
	d3.select("#degree").attr("value",max_degree);

	colorScale.domain([-max_w,0,max_w]);

	var path = svg.selectAll("path.link")
	.data(links)
	.enter().append("svg:path")
	.attr("class", function(d) { return "link source-" + d.source.key + " target-" + d.target.key; })
	.attr("d", function(d, i) { return line(splines[i]); });

	svg.selectAll("g.node")
	.data(nodes.filter(function(n) { return !n.children; }))
	.enter().append("svg:g")
	.attr("class", "node")
	.attr("id", function(d) { return "node-" + d.key; })
	.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
	.append("svg:text")
	.attr("stroke-opacity",0)
	.attr("x", function(d) { return d.x < 180 ? d.degree: -d.degree; })
	.attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
	.attr("dy", ".31em")
	.attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
	.attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
	.text(function(d) { return d.key; })
	.on("click", click)
	.on("mousedown", mouseover);
	//.on("mouseout", mouseout);

	svg.selectAll("g.node")
	.append("svg:rect")
	.attr("x",0)
	.attr("y",-3)
	.attr("width",30)
	.attr("height",7)
	.attr("width",function(d) { return d.degree})
	.attr("fill",function(d) { return colorScale(d.weight)} );  
		
	d3.select("#tensionInput").on("change", function() {
		line.tension(this.value / 100);
		path.attr("d", function(d, i) { return line(splines[i]); });
	});
  
	d3.select("#degreeInput").on("change", function() {
		allNodes = svg.selectAll('g.node');
		thresh = this.value * 1.00;
		hub = allNodes.filter(function(n){return n.degree>= thresh;});
		hub.classed("hub",true);
		others = allNodes.filter(function(n){return n.degree< thresh;});
		others.classed("hub",false);

	});
   
});

d3.select(window)
.on("mousemove", mousemove)
.on("mouseup", mouseup);

function mouse(e) {
	return [e.pageX - rx, e.pageY - ry];
}

function mousedown() {
	m0 = mouse(d3.event);
	d3.event.preventDefault();
}

function mousemove() {
	if (m0) {
		var m1 = mouse(d3.event),
		dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;
		div.style("-webkit-transform", "translateY(" + (ry - rx) + "px)rotateZ(" + dm + "deg)translateY(" + (rx - ry) + "px)");
	}
}

function mouseup() {
	if (m0) {
		var m1 = mouse(d3.event),
		dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI;

		rotate += dm;
		if (rotate > 360) rotate -= 360;
		else if (rotate < 0) rotate += 360;
		m0 = null;

		div.style("-webkit-transform", null);

		svg
		.attr("transform", "translate(" + rx + "," + ry + ")rotate(" + rotate + ")")
		.selectAll("g.node text")
		.attr("dx", function(d) { return (d.x + rotate) % 360 < 180 ? 8 : -8; })
		.attr("text-anchor", function(d) { return (d.x + rotate) % 360 < 180 ? "start" : "end"; })
		.attr("transform", function(d) { return (d.x + rotate) % 360 < 180 ? null : "rotate(180)"; })
		.attr("x", function(d) { return (d.x + rotate) % 360 < 180 ? d.degree: -d.degree; });
	}
}

var brain_views = {};
brain_views["LAmygVol"] = [90, 400, 90];
brain_views["LThalVol"] = [190, 430, 910];

// added integration with xtk
function click() {
	// get clicked element
	var element_label = d3.select(this)[0][0].innerHTML;
	console.log(element_label);
	r.camera.position = brain_views[element_label];
	// alter r
	// r.camera.position = [90, 400, 90];
}


function mouseover(d) {

	svg.selectAll("path.link")
	.style("stroke-opacity",0);

	svg.selectAll("g.node")
	.style("opacity",0.1);

	svg.select("#node-" + d.key).style("opacity", 1);
	//.text(function(d) { return d.x; });
	
	svg.selectAll("path.link.target-" + d.key)
	.classed("target", true)
	.style("stroke-opacity",1)
	.each(updateNodes("source", true));

	svg.selectAll("path.link.source-" + d.key)
	.classed("source", true)
	.style("stroke-opacity",1)
	.each(updateNodes("target", true));
	
	//document.write(d.key);
	//document.write(5 + 6);
	vr = d.key;
	//if (vr="RLatVent") {
			//remove the former GUI
			//gui.remove(volumegui);
			//gui.remove(labelmapgui);
			//gui.destroy();
			//var gui = new dat.GUI();
			
			r.remove(volume);
			volume = new X.volume();
			volume.file = 'vtk/volume.mgz';
			volume.labelmap.file = 'vtk/label.mgz';
			volume.labelmap.colortable.file = d.colortable; //'vtk/label_color_table_01.txt';
			volume.labelmap.opacity = 0.5;
			//volume._volumeRenderingCache = [];
			r.add(volume);
			r.camera.position = [0, 400, 0];     		 
			r.render();
			//r.onShowtime = function(){};
	 //}

}

// function mouseout(d) {
	// svg.selectAll("path.link.source-" + d.key)
	// .classed("source", false)
	// .each(updateNodes("target", false));

	// svg.selectAll("path.link.target-" + d.key)
	// .classed("target", false)
	// .each(updateNodes("source", false));
	
	// svg.selectAll("path.link")
	// .style("stroke-opacity",0.1);

	// svg.selectAll("g.node")
	// .style("opacity",1);

// }

function updateNodes(name, value) {
	return function(d) {
		if (value) { 
			this.parentNode.appendChild(this);
			svg.select("#node-" + d[name].key).style("opacity", 1);
		}
		svg.select("#node-" + d[name].key).classed(name, value);
	};
}

function cross(a, b) {
	return a[0] * b[1] - a[1] * b[0];
}

function dot(a, b) {
	return a[0] * b[0] + a[1] * b[1];
}


var packages = {

	// Lazily construct the package hierarchy from class names.
	root: function(classes) {
		var map = {};

		function find(name, data) {
			var node = map[name], i;
			if (!node) {
				node = map[name] = data || {name: name, children: []};
				if (name.length) {
					node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
					node.parent.children.push(node);
					node.key = name.substring(i + 1);
				}
			}
			return node;
		}

		classes.forEach(function(d) {
			find(d.name, d);
		});

		return map[""];
	},

	// Return a list of imports for the given array of nodes.
	imports: function(nodes) {
		var map = {},
		imports = [];

		// Compute a map from name to node.
		nodes.forEach(function(d) {
			map[d.name] = d;
		});

		// For each import, construct a link from the source to target node.
		nodes.forEach(function(d) {
			if (d.imports) d.imports.forEach(function(i) {
				imports.push({source: map[d.name], target: map[i]});
			});
		});

		return imports;
	}
};

function emptyclick(d) {
	
	
	svg.selectAll("path.link.source")
	.classed("source", false)
	.each(updateNodes("target", false));

	svg.selectAll("path.link.target")
	.classed("target", false)
	.each(updateNodes("source", false));
	
	svg.selectAll("path.link")
	.style("stroke-opacity",0.1);

	svg.selectAll("g.node")
	.style("opacity",1);

	r.remove(volume);
			volume = new X.volume();
			volume.file = 'vtk/volume.mgz';
			volume.labelmap.file = 'vtk/label.mgz';
			volume.labelmap.colortable.file = 'vtk/LUT_1.txt';
			volume.labelmap.opacity = 0.5;
			volume._volumeRenderingCache = [];
			r.add(volume);
			r.camera.position = [0, 400, 0];     		 
			r.render();
	
}

