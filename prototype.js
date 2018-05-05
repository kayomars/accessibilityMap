
var mapDragCorner;
var mapDragMode = false;
var mapDragMouse;


// Dummy data here
var current_loc = [1800, 750];
var allElevators = [[2000, 1000], [1600, 1000], [1850, 780]];
var allRamps = [[2100, 800], [1500, 900]];


// Used to show filters in a dropdown style
function showFilters() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Attaching event listener to checkboxes in filter menu
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#elevators').addEventListener('change', elevatorSelectionChangeHandler);
  document.querySelector('#ramps').addEventListener('change', rampSelectionChangeHandler);

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
    Util.css(cell, {"height": "50px", "width" : "50px", "position": "absolute",
                    "top": allElevators[ii][1] + "px", "left": allElevators[ii][0] + "px", "z-index" : 5});

    Util.one("#map_image").appendChild(cell);
  }

  // Adding all ramps to the map with no visibility
  for (var ii = 0; ii < allRamps.length; ii += 1) {
    var cell = Util.create("div", {"id": "ramp-" + ii, "class": "ramp"});
    Util.css(cell, {"height": "50px", "width" : "50px", "position": "absolute",
                    "top": allRamps[ii][1] + "px", "left": allRamps[ii][0] + "px",
                    "display": "none", "z-index" : 5});

    Util.one("#map_image").appendChild(cell);
  }

  // Attaching event listener to elevators
  document.getElementById('elevator-1').addEventListener('click', function () {

    console.log("test");
  });


  // Attaching event listener to zoom magnify_buttons
  document.getElementById('plus').addEventListener('click', function () {

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

  document.addEventListener('mouseup', function (evt) {
    mapDragMode = false;
  });


});


// Handles selection changes in the filters dropdown for elevators
function elevatorSelectionChangeHandler() {

  var holdAllElevs = document.getElementsByClassName('elevator');

  if (elevators.checked) {
    for (var i = 0; i < holdAllElevs.length; i++) {
      console.log(holdAllElevs);
      holdAllElevs[i].style.display = "flex";
    }
  } else {
    for (var i = 0; i < holdAllElevs.length; i++) {
      console.log(holdAllElevs);
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
