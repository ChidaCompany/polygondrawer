function init() {
    var $ = go.GraphObject.make;
    myDiagram = $(go.Diagram, "drawer");
    myDiagram.toolManager.mouseDownTools.insertAt(3, new GeometryReshapingTool());
    myDiagram.nodeTemplateMap.add("PolygonDrawing",
        $(go.Node, {
                locationSpot: go.Spot.Center
            }, // to support rotation about the center
            new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify), {
                selectionAdorned: true,
                selectionObjectName: "SHAPE",
                selectionAdornmentTemplate: // custom selection adornment: a blue rectangle
                    $(go.Adornment, "Auto",
                        $(go.Shape, {
                            stroke: "dodgerblue",
                            fill: null
                        }),
                        $(go.Placeholder, {
                            margin: -1
                        }))
            }, {
                resizable: true,
                resizeObjectName: "SHAPE"
            }, {
                rotatable: true,
                rotateObjectName: "SHAPE"
            }, {
                reshapable: true
            }, // GeometryReshapingTool assumes nonexistent Part.reshapeObjectName would be "SHAPE"
            $(go.Shape, {
                    name: "SHAPE",
                    fill: "lightgray",
                    strokeWidth: 1.5
                },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
                new go.Binding("angle").makeTwoWay(),
                new go.Binding("geometryString", "geo").makeTwoWay(),
                new go.Binding("fill"),
                new go.Binding("stroke"),
                new go.Binding("strokeWidth"))
        ));
    myDiagram.add(
    $(go.Part,  // this Part is not bound to any model data
      { layerName: "Background", position: new go.Point(0, 0),
        selectable: false, pickable: false },
      $(go.Picture, "../assets/render.png")
    ));
    myDiagram.addDiagramListener("ObjectSingleClicked",
      function(e) {
        var part = e.subject.part;
        alert(JSON.stringify(part.data)); 
      });
    // create polygon drawing tool for myDiagram, defined in PolygonDrawingTool.js
    var tool = new PolygonDrawingTool();
    // provide the default JavaScript object for a new polygon in the model
    tool.archetypePartData = {
        fill: "yellow",
        stroke: "blue",
        strokeWidth: 1,
        category: "PolygonDrawing"
    };
    tool.isPolygon = true; // for a polyline drawing tool set this property to false
    // install as first mouse-down-tool
    myDiagram.toolManager.mouseDownTools.insertAt(0, tool);
    load(); // load a simple diagram from the textarea
}

// this command ends the PolygonDrawingTool
function finish(commit) {
    var tool = myDiagram.currentTool;
    if (commit && tool instanceof PolygonDrawingTool) {
        var lastInput = myDiagram.lastInput;
        if (lastInput.event instanceof window.MouseEvent) tool.removeLastPoint(); // remove point from last mouse-down
        tool.finishShape();
    } else {
        tool.doCancel();
    }
}
// this command removes the last clicked point from the temporary Shape
function undo() {
    var tool = myDiagram.currentTool;
    if (tool instanceof PolygonDrawingTool) {
        var lastInput = myDiagram.lastInput;
        if (lastInput.event instanceof window.MouseEvent) tool.removeLastPoint(); // remove point from last mouse-down
        tool.undo();
    }
}

// save a model to and load a model from Json text, displayed below the Diagram
function save() {
    var str = '{ "position": "' + go.Point.stringify(myDiagram.position) + '",\n  "model": ' + myDiagram.model.toJson() + ' }';
    document.getElementById("mySavedDiagram").value = str;
}

function load() {
    var str = document.getElementById("mySavedDiagram").value;
    try {
        var json = JSON.parse(str);
    } catch (ex) {
        var json = { position: "0,0", model: {} };
    } finally {
      myDiagram.initialPosition = go.Point.parse(json.position || "0 0");
      myDiagram.model = go.Model.fromJson(json.model);
      myDiagram.model.undoManager.isEnabled = true;
    }
}

init();