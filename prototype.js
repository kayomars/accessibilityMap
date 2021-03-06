
var mapDragCorner;
var newMapDragCorner;
var mapDragMode = false;
var mapDragMouse;
var filtersShown = false;

var zoomScale = 1;


// Dummy data here
var current_loc = [1800, 750];
var allElevators = [[2100, 810, "6 "], [1590, 860, "7 "], [1830, 790, "10"], [1790, 700, "13"], [1790, 1120, "3 "], [1510, 780, "9 "], [1430, 570, "35"],
                    [1590, 460, "37"], [1860, 480, "24"], [2020, 210, "32a"], [2050, 320, "32b"], [2210, 160, "32c"],
                    [2110, 590, "16"], [2240, 460, "56"]];
var allRamps = [[1510, 860, "7"], [1770, 980, "3"], [2010, 860, "4"], [1920, 300, "36"]];
var allDoors = [[1510, 900, "7"], [2050, 540, "16"]];
var allTraffic = [[1600, 890], [1700, 850], [1800, 810], [1900, 760], [2000, 710]];
var buildings = new Map([["7", [1550, 870]], ["5", [1600, 1000]], ["3", [1770, 970]], ["10", [1820, 730]], ["13", [1650, 650]], ["32", [2150, 210]],
                 ["26", [2000, 450]], ["36", [1910, 250]], ["34", [1820, 300]], ["stata", [2100, 210]], ["4", [2050, 860]], ["16", [2150, 500]], 
                 ["8", [2050, 640]]]);

var headingFor32 = "Directions to Building 32";
var dirCurrentTo32 = "1) Use elevator to get to level 2 \n" + "2) Head East until you reach the end of the hall \n" +
                     "3) Turn left and head forward 50 feet until you enter Building 16 \n" +
                     "4) Use the elevator on the right to get to level 1 \n" +
                     "5) Head East into Building 56 \n" + "6) Exit to the left on reaching Building 56 \n" +
                     "7) Head straight into Building 32 \n";

var headingForNone = "No Directions Found!";
var dirToNone = "We're sorry! \n" +
                "Directions to your destination could not be found. \n";


// Used to toggle filters in a dropdown style
function toggleFilters() {
    document.getElementById("myDropdown").classList.toggle("show");
    filtersShown = !filtersShown;
}

// Attaching click event listener to fade away click if needed
document.addEventListener('mousedown', function (evt) {
  if (filtersShown) {

    if (evt.target.classList.contains("dropdown-content")) {
      // Do nothing
    } else if (evt.srcElement.offsetParent != null && evt.srcElement.offsetParent.classList.contains("dropdown-content")) {
      // Do nothing
    } else if (evt.target.classList.contains("dropbtn")) {
      // Do nothing
    } else {
      toggleFilters();
    }
  }
});


// Attaching event listener to checkboxes in filter menu
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#elevators').addEventListener('change', elevatorSelectionChangeHandler);
  document.querySelector('#ramps').addEventListener('change', rampSelectionChangeHandler);
  document.querySelector('#sliding_doors').addEventListener('change', doorSelectionChangeHandler);
  document.querySelector('#high_traffic').addEventListener('change', trafficSelectionChangeHandler);

  Util.one("#txtSearch").focus();
  centerMap(current_loc);
  mapDragCorner = [Util.offset(Util.one("#map_image")).left, Util.offset(Util.one("#map_image")).top];
  newMapDragCorner = [Util.offset(Util.one("#map_image")).left, Util.offset(Util.one("#map_image")).top];
  
  var pin = Util.create("div", {"id": "pin", "class": "pin"});
  Util.css(pin, {"height": "80px", "width" : "50px", "position": "absolute",
                  "top": current_loc[1] + "px", "left": current_loc[0] + "px", "z-index" : 5});
  pin.style.display = "none";
  Util.one("#map_image").appendChild(pin);

  // Adding functionality to close buttons
  var directionPanel = document.getElementById('navigation_pane');

  var closeButton = document.getElementsByClassName("close")[0];
  var closeButton2 = document.getElementById("finished_nav");

  closeButton.onclick = function() {
      directionPanel.style.display = "none";
  }

  closeButton2.onclick = function() {
      directionPanel.style.display = "none";
  }

  // Adding location marker to the map
  var pulse_holder = Util.create("div", {"id": "holder"});
  Util.css(pulse_holder, {"position": "absolute",
                    "top": current_loc[1] + "px", "left": current_loc[0] + "px", "z-index" : 6});
  Util.one("#map_image").appendChild(pulse_holder);
  Util.one("#holder").appendChild(Util.create("div", {"class": "dot"}));
  Util.one("#holder").appendChild(Util.create("div", {"class": "pulse"}));

  // Adding all elevators to the map
  for (var ii = 0; ii < allElevators.length; ii += 1) {
    var cell = Util.create("div", {"id": "elevator-" + allElevators[ii][2], "class": "elevator"});
    Util.css(cell, {"height": "50px", "width" : "50px", "position": "absolute",
                    "top": allElevators[ii][1] + "px", "left": allElevators[ii][0] + "px", "z-index" : 5});

    var tooltip = Util.create("span", {"id": "tooltip-elevator-" + allElevators[ii][2], "class": "tooltiptext"});
    tooltip.innerHTML = "Elevator <br> Building " + allElevators[ii][2].substring(0, 2) + "<br> Floors: 1-5";
    cell.appendChild(tooltip);

    Util.one("#map_image").appendChild(cell);
  }

  // Adding all ramps to the map with no visibility
  for (var ii = 0; ii < allRamps.length; ii += 1) {
    var cell = Util.create("div", {"id": "ramp-" + allRamps[ii][2], "class": "ramp"});
    Util.css(cell, {"height": "50px", "width" : "50px", "position": "absolute",
                    "top": allRamps[ii][1] + "px", "left": allRamps[ii][0] + "px",
                    "display": "none", "z-index" : 5});

    var tooltip = Util.create("span", {"id": "tooltip-ramp-" + allRamps[ii][2], "class": "tooltiptext"});
    tooltip.innerHTML = "Ramp <br> Building " + allRamps[ii][2] + "<br> Floors: 1";
    cell.appendChild(tooltip);

    Util.one("#map_image").appendChild(cell);
  }

  // Adding all automatic doors to the map with no visibility
  for (var ii = 0; ii < allDoors.length; ii += 1) {
    var cell = Util.create("div", {"id": "door-" + allDoors[ii][2], "class": "door"});
    Util.css(cell, {"height": "50px", "width" : "50px", "position": "absolute",
                    "top": allDoors[ii][1] + "px", "left": allDoors[ii][0] + "px",
                    "display": "none", "z-index" : 5});
                    
    var tooltip = Util.create("span", {"id": "tooltip-door-" + allDoors[ii][2], "class": "tooltiptext"});
    tooltip.innerHTML = "Sliding Door <br> Building " + allDoors[ii][2] + "<br> Floors: 1, 2, 5";
    cell.appendChild(tooltip);

    Util.one("#map_image").appendChild(cell);
  }

  // Adding all high traffic markers to the map with no visibility
  for (var ii = 0; ii < allTraffic.length; ii += 1) {
    var cell = Util.create("div", {"id": "traffic-" + ii, "class": "high_traffic"});
    Util.css(cell, {"height": "30px", "width" : "120px", "position": "absolute",
                    "top": allTraffic[ii][1] + "px", "left": allTraffic[ii][0] + "px",
                    "display": "none", "z-index" : 4, "opacity":0.7, "transform": "rotate(-22deg)"});

    Util.one("#map_image").appendChild(cell);
  }



  // Attaching event listener to elevators
  //document.getElementById('elevator-1').addEventListener('click', function () {
//
 //   console.log("test");
 // });

  // Attaching event listener to center_loc button
  document.getElementById('center_loc').addEventListener('click', function () {
    centerMap(current_loc);
  });


  // Attaching event listener to zoom magnify_buttons
  document.getElementById('plus').addEventListener('click', function () {
    var zoomLevel = getComputedStyle(document.body).getPropertyValue('--zoom-level');

    var map = document.getElementById("map_image");

    console.log(window.getComputedStyle(map, null).getPropertyValue("transform"));
    var map = document.getElementById("map_image");

    map.classList.add("zoom_in");
    var transformBy = getComputedStyle(document.body).getPropertyValue('--transform-by');
    var newTransformBy = parseFloat(transformBy) + 0.5;
    document.documentElement.style.setProperty("--initial", transformBy);
    document.documentElement.style.setProperty("--final", newTransformBy);

    map.addEventListener('animationend', function() {
      map.classList.remove("zoom_in");
      document.documentElement.style.setProperty("--transform-by", newTransformBy);
    });

  });

  // Attaching event listener to unzoom magnify_buttons
  document.getElementById('minus').addEventListener('click', function () {
    var map = document.getElementById("map_image");
    var transformBy = getComputedStyle(document.body).getPropertyValue('--transform-by')
    var newTransformBy = parseFloat(transformBy) - 0.5;
    document.documentElement.style.setProperty("--initial", transformBy);
    document.documentElement.style.setProperty("--final", newTransformBy);
    map.classList.add("zoom_out");


    map.addEventListener('animationend', function() {
      map.classList.remove("zoom_out");
      document.documentElement.style.setProperty("--transform-by", newTransformBy);
    });
  });


  // Attaching event listeners to drag map around
  document.getElementById('image_holder').addEventListener('mousedown', function (evt) {

    console.log("mouse down");

    evt.preventDefault();

    var img = Util.one("#map_image");

    mapDragMouse = [evt.clientX, evt.clientY];
    mapDragMode = true;
    console.log(mapDragMouse);
    console.log(mapDragCorner);
  });

  document.getElementById('image_holder').addEventListener('mousemove', function (evt) {
    if (mapDragMode) {

      // Find image and its parents
      var holder = Util.one("#image_holder");
      var holderHolder = Util.one(".map_container");
      var img = Util.one("#map_image");

      console.log(mapDragCorner[0] + (evt.clientX - mapDragMouse[0])
                          - Util.offset(holderHolder).left);
      // Change the image offset by the mouse position delta
      newMapDragCorner = [mapDragCorner[0] + (evt.clientX - mapDragMouse[0]) ,
                          mapDragCorner[1] + (evt.clientY - mapDragMouse[1]) ];
      Util.css(img, {"left" : newMapDragCorner[0] - Util.offset(holderHolder).left + "px",
                     "top" : newMapDragCorner[1] - Util.offset(holderHolder).top+ "px",
                               "z-index" : 3});
      // img.style.left = mapDragCorner[0] + (evt.clientX - mapDragMouse[0]);
      // img.style.top = mapDragCorner[1];

      console.log(Util.offset(img));
    }
  });

  document.addEventListener('mouseup', function (evt) {
    mapDragCorner = newMapDragCorner;
    mapDragMode = false;
  });

  // Register touch event handlers
  // from https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events
  document.getElementById('image_holder').addEventListener('touchstart', process_touchstart, false);
  document.getElementById('image_holder').addEventListener('touchmove', process_touchmove, false);
  document.getElementById('image_holder').addEventListener('touchcancel', process_touchcancel, false);
  document.getElementById('image_holder').addEventListener('touchend', process_touchend, false);




});

// List of all active touches
var ongoingTouches = [];
// Positions the touches start in
var touchPositions = [];
// Original distance between two pinching fingers
var pinchDist = 0;

// Copy the given touch event
// from https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events
function copyTouch(touch) {
  return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
}

// Find index of an ongoing touch
// from https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
function ongoingTouchIndexById(idToFind) {
  for (var i = 0; i < ongoingTouches.length; i++) {
    var id = ongoingTouches[i].identifier;

    if (id == idToFind) {
      return i;
    }
  }
  return -1;    // not found
}

// Figure out how many fingers are active and make it good
function processNumFingers (evt) {
  // store the map position if dragging (one finger)
  if (ongoingTouches.length == 1){
    console.log("woo 1 touch");

    var img = Util.one("#map_image");
    //mapDragCorner = [Util.offset(img).left, Util.offset(img).top];
    mapDragMode = true;
  }

  // Setup the system for pinching (two fingers)
  if (ongoingTouches.length == 2){
    pinchDist = Math.sqrt((touchPositions[0]["touchX"] - touchPositions[1]["touchX"]) ** 2
                      + (touchPositions[0]["touchY"] - touchPositions[1]["touchY"]) ** 2);
  }
}

// Handle any touch_start events
// from https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
function process_touchstart (evt) {
  evt.preventDefault();
  console.log("touchstart.");
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    console.log("touchstart:" + i + "...");
    ongoingTouches.push(copyTouch(touches[i]));
    touchPositions.push({"touchX" : touches[i].pageX, "touchY" : touches[i].pageY});
    console.log("touchstart:" + i + ".");
  }

  // Setup for however many fingers are touching
  processNumFingers(evt);
}

// Handle any touch_move events
// from https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
function process_touchmove(evt) {
  evt.preventDefault();
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {
      console.log("continuing touch "+idx);

      ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
      console.log(".");
    } else {
      console.log("can't figure out which touch to continue");
    }
  }

  // Update the drag position if necessary
  if (ongoingTouches.length == 1){
    // Find image and its parents
    var holder = Util.one("#image_holder");
    var holderHolder = Util.one(".map_container");
    var img = Util.one("#map_image");

    newMapDragCorner = [mapDragCorner[0] + (ongoingTouches[0].pageX - touchPositions[0]["touchX"]) ,
                        mapDragCorner[1] + (ongoingTouches[0].pageY - touchPositions[0]["touchY"]) ];
    Util.css(img, {"left" : newMapDragCorner[0] - Util.offset(holderHolder).left + "px",
    "top" : newMapDragCorner[1] - Util.offset(holderHolder).top+ "px"}); 
    // Change the image offset by the mouse position delta
    // Util.css(img, {"left" : mapDragCorner[0] - Util.offset(holderHolder).left
                      // + (ongoingTouches[0].pageX - touchPositions[0]["touchX"]) + "px",
                   // "top" : mapDragCorner[1] - Util.offset(holderHolder).top
                      // + (ongoingTouches[0].pageY - touchPositions[0]["touchY"]) + "px",
                    // "z-index" : 3});
                      
  }

  // Update the zoom if necessary
  if (ongoingTouches.length == 2){

    var currPinch = Math.sqrt((ongoingTouches[0].pageX - ongoingTouches[1].pageX) ** 2
                      + (ongoingTouches[0].pageY - ongoingTouches[1].pageY) ** 2);
    var zoomScale = currPinch / pinchDist;

    // Get the map and its current scale
    var map = document.getElementById("map_image");
    var currentScale = window.getComputedStyle(map, null).getPropertyValue("transform");
    var values = currentScale.split('(')[1],
    values = values.split(')')[0],
    values = values.split(',');

    // Calculate what the new scale value should be and set it
    var setScale = values[0] * zoomScale;
    var transformString = "scale(" + setScale + "," + setScale + ")"
    map.style.transform = "scale(" + setScale + "," + setScale + ")";

    pinchDist = currPinch;

    // console.log(window.getComputedStyle(map, null).getPropertyValue("transform"));
    // console.log(currentScale[0]);
    console.log("Zoom scale: " + setScale);
    // console.log(transformString);
    // console.log("Zoom scale: " + zoomScale);
  }
}

// Handle any touch_end events
// from https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
function process_touchend(evt) {
  evt.preventDefault();
  console.log("touchend");
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier);

    if (idx >= 0) {

      ongoingTouches.splice(idx, 1);  // remove it; we're done
      touchPositions.splice(idx, 1);
    } else {
      console.log("can't figure out which touch to end");
    }
  }
  
  mapDragCorner = newMapDragCorner; 

  // Setup for however many fingers are touching
  processNumFingers(evt);
}

// Handle any canceled touch events
// from https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
function process_touchcancel(evt) {
  evt.preventDefault();
  console.log("touchcancel.");
  var touches = evt.changedTouches;

  for (var i = 0; i < touches.length; i++) {
    var idx = ongoingTouchIndexById(touches[i].identifier);
    ongoingTouches.splice(idx, 1);  // remove it; we're done
    touchPositions.splice(idx, 1);
  }
}


// Handles selection changes in the filters dropdown for elevators
function elevatorSelectionChangeHandler() {

  var holdAllElevs = Util.all('.elevator');
  console.log(holdAllElevs);

  if (elevators.checked) {
    for (var i = 0; i < holdAllElevs.length; i++) {
      holdAllElevs[i].style.display = "flex";
    }
  } else {
    for (var i = 0; i < holdAllElevs.length; i++) {
      holdAllElevs[i].style.display = "none";
    }
  }
}

// Handles selection changes in the filters dropdown for ramps
function rampSelectionChangeHandler() {

  var holdAllRamps = document.getElementsByClassName('ramp');

  if (ramps.checked) {
    for (var i = 0; i < holdAllRamps.length; i++) {

      holdAllRamps[i].style.display = "flex";
    }
  } else {
    for (var i = 0; i < holdAllRamps.length; i++) {

      holdAllRamps[i].style.display = "none";
    }
  }
}

// Handles selection changes in the filters dropdown for sliding doors
function doorSelectionChangeHandler() {

  var holdAllDoors = document.getElementsByClassName('door');

  if (sliding_doors.checked) {
    for (var i = 0; i < holdAllDoors.length; i++) {

      holdAllDoors[i].style.display = "flex";
    }
  } else {
    for (var i = 0; i < holdAllDoors.length; i++) {

      holdAllDoors[i].style.display = "none";
    }
  }
}

// Handles selection changes in the filters dropdown for traffic
function trafficSelectionChangeHandler() {

  var holdAllTraffic = document.getElementsByClassName('high_traffic');

  if (high_traffic.checked) {
    for (var i = 0; i < holdAllTraffic.length; i++) {

      holdAllTraffic[i].style.display = "flex";
    }
  }
  else {
    for (var i = 0; i < holdAllTraffic.length; i++) {

      holdAllTraffic[i].style.display = "none";
    }
  }
}

function searchMap(searchForm) {
  var searchTerm = searchForm.elements[0]
                   .value.toLowerCase()
                   .replace("lobby", "")
                   .replace("building", "")
                   .replace("room", "")
                   .replace(/\s+/g, "");

  if (buildings.has(searchTerm)) {
    centerMap(buildings.get(searchTerm));
    var pin = Util.one("#pin");
    Util.css(pin, {"left": buildings.get(searchTerm)[0] + "px", 
                   "top": buildings.get(searchTerm)[1] + "px"}); 
    pin.style.display = "flex";
  }
  else if (buildings.has(searchTerm.split("-")[0])) {
    centerMap(buildings.get(searchTerm.split("-")[0]));
    var pin = Util.one("#pin");
    Util.css(pin, {"left": buildings.get(searchTerm.split("-")[0])[0] + "px", 
                   "top": buildings.get(searchTerm.split("-")[0])[1] + "px"}); 
    pin.style.display = "flex";
  }

  navigateTo(searchTerm);

  return false;
}


function centerMap(centerLocation) {
  var imgHolder = Util.one("#image_holder");
  var holderSize = [imgHolder.clientWidth, imgHolder.clientHeight];
  console.log(holderSize);
  var img = Util.one("#map_image");
  Util.css(img, {"left" : -centerLocation[0] + holderSize[0]/2 + "px",
                 "top" : -centerLocation[1] + holderSize[1]/2 + "px",
                 "z-index" : 3});
  mapDragCorner = [-centerLocation[0] + holderSize[0]/2 + Util.offset(imgHolder).left,
                   -centerLocation[1] + holderSize[1]/2 + Util.offset(imgHolder).top];
}


// Returns directions to destination from current location if they exist
function navigateTo(destination) {

  var directionPanel = document.getElementById('navigation_pane');

  if (destination.substring(0, 2) === "32") {
    document.getElementById('modal-body').innerHTML = dirCurrentTo32;
    document.getElementById('heading_here').innerHTML = headingFor32;
  } else {
    document.getElementById('modal-body').innerHTML = dirToNone;
    document.getElementById('heading_here').innerHTML = headingForNone;
  }
  directionPanel.style.display = "block";
}
