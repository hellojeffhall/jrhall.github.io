var tool = {};

tool.state = {};
tool.state.mode = 'initial';
tool.state.tempCollection = [];
tool.state.tempDots = [] ;
tool.state.tempPolyline ;
tool.state.tempPolygon ; 

tool.stateChange = function (stateName) {
  tool.state.mode = (tool.state.mode === stateName) ? 'initial' : stateName ;
  console.log("tool.state.mode = " + tool.state.mode);
};


tool.toolbar = document.getElementById('toolbar');
tool.app = document.getElementById('app');
tool.mapdiv = document.getElementById('map');


tool.button_pointMaker = document.createElement('button');
tool.button_pointMaker.innerHTML = "Point";
tool.button_pointMaker.style.marginLeft = "4%";
tool.button_pointMaker.style.marginRight = "2%";
tool.button_pointMaker.addEventListener( 'click', function (ev) {
  tool.stateChange('pointMaker') ;
  tool.button_pointMaker.onStateChange(tool.state.mode==='pointMaker');
});

tool.button_pointMaker.onStateChange = function(isActivated){
  tool.button_pointMaker.style.color= (isActivated)? 'white' : '';
  tool.button_pointMaker.style.backgroundColor = (isActivated)? 'darkblue' : '';
  tool.button_pointMaker.innerHTML = (isActivated) ? 'Done' : 'Point';
};

tool.button_polygonMaker = document.createElement('button');
tool.button_polygonMaker.style.marginLeft = "2%";
tool.button_polygonMaker.style.marginRight = "4%";
tool.button_polygonMaker.innerHTML = "Geofence";

tool.button_polygonMaker.addEventListener( 'click', function( ev) {
  tool.stateChange('polygonMaker');
  tool.button_polygonMaker.onStateChange(tool.state.mode==='polygonMaker');
});

tool.button_polygonMaker.onStateChange = function (isActivated) {
  tool.button_polygonMaker.style.color= (isActivated)? 'white' : '';
  tool.button_polygonMaker.style.backgroundColor = (isActivated)? 'darkblue' : '';
  tool.button_polygonMaker.innerHTML = (isActivated) ? 'Done' : 'Geofence';
};

tool.toolbar.appendChild(tool.button_pointMaker);
tool.toolbar.appendChild(tool.button_polygonMaker);

tool.map = L.map('map').setView([43.00059846846789,-75.97487926483154], 15);
tool.mainLayer = new L.tileLayer(
  'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
  {
    transparent : true,
    attribution : '<a href="http://www.thunderforest.com">Thunderforest.com</a>'
  }
);
tool.map.addLayer(tool.mainLayer);

tool.makePoint = function(latlng) {
  var temp = 
    L.marker(latlng,{title: latlng.lat + ', ' + latlng.lng}).addTo(tool.map);
  temp.bindPopup(tool.generatePopoverHTML(temp)); 
};

tool.makeDot = function (latlng) {
  var temp_dot = L.circle(
    [latlng.lat, latlng.lng],
    5, 
    {
      fillColor:'red',
      color : 'red'
    }
  ).addTo(tool.map);
  tool.state.tempDots.push( temp_dot );
};

tool.makePolygon = function ( array_of_latlng ){
  var temp = L.polygon(
    array_of_latlng,
    {
      fillColor : 'blue',
      color     : 'blue'
    }
  );
  return temp;
};

tool.makePolygonPoint = function(latlng) {

  tool.state.tempCollection.push(latlng);
  tool.makeDot(latlng);
 
  if(tool.state.tempCollection.length===2){
    //With only two points, we can draw a line.
    var first = tool.state.tempCollection[0];
    var second = tool.state.tempCollection[1];
    tool.state.tempPolyline = L.polyline(
      [
        [first.lat, first.lng],
        [second.lat, second.lng]
      ],
      {
        color : 'red', 
        weight : 5 
      }
    ).addTo(tool.map);
  }
  else if(tool.state.tempCollection.length > 2 && tool.state.tempPolyline!==undefined){
    // If there are more than two points, and we still have a temp
    // polyline, then we need to remove the polyline. 
    // Then, call the function that creates the polygon.

    tool.map.removeLayer( tool.state.tempPolyline );    
    tool.state.tempPolyline = undefined ;
    tool.state.tempDots.forEach( function(temp_dot)  {
      tool.map.removeLayer(temp_dot); 
    });
    tool.state.tempDots.length = 0; 
    tool.state.tempPolygon = tool.makePolygon(tool.state.tempCollection).addTo(tool.map);
  }

  else if(tool.state.tempCollection.length > 2 && tool.state.tempPolyline===undefined){
    tool.map.removeLayer( tool.state.tempPolygon );
    tool.state.tempPolygon = tool.makePolygon(tool.state.tempCollection).addTo(tool.map);
  }
};

tool.map.addEventListener('click', function (ev ) {
  var dictionary_of_actions = {
    pointMaker : tool.makePoint,
    polygonMaker :tool.makePolygonPoint,
    initial : function(){}
  };
  dictionary_of_actions[tool.state.mode](ev.latlng);   
});

tool.kill = function(layer) {
  tool.map.removeLayer(layer);
};

tool.generatePopoverHTML = function(layer) {
  var a = document.createElement('a');
  a.innerHTML = 'Delete';
  a.addEventListener('click', function() {
    tool.kill(layer); 
  });
  return a;
};

