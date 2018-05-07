
var mapDragCorner;
var mapDragMode = false;
var mapDragMouse;
var filtersShown = false;


// Dummy data here
var current_loc = [1800, 750];
var allElevators = [[2100, 810, 6], [1590, 860, 7], [1830, 790, 10], [1790, 700, 13], [1790, 1120, 3], [1510, 780, 9], [1430, 570, 35], 
                    [1590, 460, 37], [1690, 470, 39], [1860, 480, 24], [1860, 300, 36], [2020, 210, 32], [2050, 320, 32], [2210, 160, 32], 
                    [2050, 620, 8], [2110, 590, 16], [2240, 460, 56]];
var allRamps = [[1510, 860, 7], [1770, 980, 3], [2010, 860, 4], [1920, 300, 36]];
var allTraffic = [[1600, 890], [1700, 850], [1800, 810], [1900, 760], [2000, 710]];
var buildings = new Map([["7", [1580, 900]], ["5", [1600, 1000]], ["3", [1750, 980]], ["10", [1820, 730]], ["13", [1700, 680]], ["32", [2100, 210]], 
                 ["26", [2000, 450]], ["36", [1910, 250]], ["34", [1820, 350]], ["stata", [2100, 210]]]);


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
  document.querySelector('#sliding_doors').addEventListener('change', rampSelectionChangeHandler);
  document.querySelector('#high_traffic').addEventListener('change', trafficSelectionChangeHandler);
  
  Util.one("#txtSearch").focus(); 
  centerMap(current_loc); 

  // Adding location marker to the map
  var pulse_holder = Util.create("div", {"id": "holder"});
  Util.css(pulse_holder, {"position": "absolute",
                    "top": current_loc[1] + "px", "left": current_loc[0] + "px", "z-index" : 6});
  Util.one("#map_image").appendChild(pulse_holder);
  Util.one("#holder").appendChild(Util.create("div", {"class": "dot"}));
  Util.one("#holder").appendChild(Util.create("div", {"class": "pulse"}));

  // Adding all elevators to the map
  for (var ii = 0; ii < allElevators.length; ii += 1) {
    var cell = Util.create("div", {"id": "elevator-" + ii, "class": "elevator"});
    Util.css(cell, {"height": "40px", "width" : "40px", "position": "absolute",
                    "top": allElevators[ii][1] + "px", "left": allElevators[ii][0] + "px", "z-index" : 5});

    Util.one("#map_image").appendChild(cell);
  }

  // Adding all ramps to the map with no visibility
  for (var ii = 0; ii < allRamps.length; ii += 1) {
    var cell = Util.create("div", {"id": "ramp-" + ii, "class": "ramp"});
    Util.css(cell, {"height": "40px", "width" : "40px", "position": "absolute",
                    "top": allRamps[ii][1] + "px", "left": allRamps[ii][0] + "px",
                    "display": "none", "z-index" : 5});

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
  document.getElementById('elevator-1').addEventListener('click', function () {

    console.log("test");
  });


  // Attaching event listener to zoom magnify_buttons
  document.getElementById('plus').addEventListener('click', function () {
    console.log(document.getElementById('plus'));
    var transformBy = getComputedStyle(document.body).getPropertyValue('--transform-by');
    var newTransformBy = parseFloat(transformBy) + 0.5;
    document.documentElement.style.setProperty("--transform-by", newTransformBy);
    // if (zoomLevel == 0) {
    //
    //   var imgHolder = document.getElementById('map_image');
    //
    //   if (elevators.checked && ramps.checked) {
    //     imgHolder.style.backgroundImage = "url('images/home_elevators_ramps.png')";
    //   } else if (!elevators.checked && ramps.checked) {
    //     imgHolder.style.backgroundImage = "url('images/home_ramps.png')";
    //   } else if (!elevators.checked && !ramps.checked) {
    //     imgHolder.style.backgroundImage = "url('images/home_none.png')";
    //   } else {
    //     imgHolder.style.backgroundImage = "url('images/home_image.png')";
    //   }
    //
    //   zoomLevel = 1;
    // }
  });

  // Attaching event listener to unzoom magnify_buttons
  document.getElementById('minus').addEventListener('click', function () {

    // if (zoomLevel == 1) {
    //
    //   var imgHolder = document.getElementById('map_image');
    //
    //   if (elevators.checked && ramps.checked) {
    //     imgHolder.style.backgroundImage = "url('images/zoomout_elevators_ramps.png')";
    //   } else if (!elevators.checked && ramps.checked) {
    //     imgHolder.style.backgroundImage = "url('images/zoomout_ramps.png')";
    //   } else if (!elevators.checked && !ramps.checked) {
    //     imgHolder.style.backgroundImage = "url('images/zoomout_none.png')";
    //   } else {
    //     imgHolder.style.backgroundImage = "url('images/home_zoomout.png')";
    //   }
    //   zoomLevel = 0;
  //}
  });


  // Attaching event listeners to drag map around
  document.getElementById('image_holder').addEventListener('mousedown', function (evt) {

    console.log("mouse down");
    evt.preventDefault();

    var img = Util.one("#map_image");
    mapDragCorner = [Util.offset(img).left, Util.offset(img).top];
    mapDragMouse = [evt.clientX, evt.clientY];
    mapDragMode = true;
  });

  document.getElementById('image_holder').addEventListener('mousemove', function (evt) {
    if (mapDragMode) {

      // Find image and its parents
      var holder = Util.one("#image_holder");
      var holderHolder = Util.one(".map_container");
      var img = Util.one("#map_image");

      // Change the image offset by the mouse position delta
      Util.css(img, {"left" : mapDragCorner[0] + (evt.clientX - mapDragMouse[0])
                          - Util.offset(holderHolder).left + "px",
                     "top" : mapDragCorner[1] + (evt.clientY - mapDragMouse[1])
                          - Util.offset(holderHolder).top + "px",
                               "z-index" : 3});
      // img.style.left = mapDragCorner[0] + (evt.clientX - mapDragMouse[0]);
      // img.style.top = mapDragCorner[1];
    }
  });

  // Register touch event handlers
  // from https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events
  document.getElementById('image_holder').addEventListener('touchstart', process_touchstart, false);
  document.getElementById('image_holder').addEventListener('touchmove', process_touchmove, false);
  document.getElementById('image_holder').addEventListener('touchcancel', process_touchcancel, false);
  document.getElementById('image_holder').addEventListener('touchend', process_touchend, false);

  document.addEventListener('mouseup', function (evt) {
    mapDragMode = false;
  });


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
    mapDragCorner = [Util.offset(img).left, Util.offset(img).top];
    mapDragMode = true;
  }

  // Setup the system for pinching (two fingers)
  if (ongoingTouches.length == 2){
    pinchDist = sqrt((touchPositions[0]["touchX"] - touchPositions[1]["touchX"]) ** 2
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
      var holderHolder = Util.one(".map_container");
      var img = Util.one("#map_image");

      // Change the image offset by the mouse position delta
      Util.css(img, {"left" : mapDragCorner[0] - Util.offset(holderHolder).left
                        + (ongoingTouches[0].pageX - touchPositions[0]["touchX"]) + "px",
                     "top" : mapDragCorner[1] - Util.offset(holderHolder).top
                        + (ongoingTouches[0].pageY - touchPositions[0]["touchY"]) + "px",
                      "z-index" : 3});
  }

  // Update the zoom if necessary
  if (ongoingTouches.length == 2){
    var currPinch = sqrt((ongoingTouches[0].pageX - ongoingTouches[1].pageX) ** 2
                      + (ongoingTouches[0].pageY - ongoingTouches[1].pageY) ** 2);
    var zoomScale = currPinch / pinchDist;
    console.log("Zoom scale: " + zoomScale);
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

  var holdAllElevs = document.getElementsByClassName('elevator');

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

// Handles selection changes in the filters dropdown for traffic
function trafficSelectionChangeHandler() {

  var holdAllTraffic = document.getElementsByClassName('high_traffic');

  if (high_traffic.checked) {
    for (var i = 0; i < holdAllTraffic.length; i++) {

      holdAllTraffic[i].style.display = "flex";
    }
  } else {
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
  }
  
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
}

