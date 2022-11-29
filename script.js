Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjZTA0MTg3NS05MDI3LTRkODgtOWY4MC0wN2FhZmI5MmIwNDciLCJpZCI6MTA1OTM2LCJpYXQiOjE2NjczMzc5NjV9.XYrEYpTnMof8gTJYhXaQmIu3Pj2CAcnvE2fB0DxYcVU";

const { BoundingSphere, BoundingSphereState, Cartesian3, Color, Viewer } =
  window.Cesium;
//Imagery Provider
const imageryProvider = new Cesium.ArcGisMapServerImageryProvider({
  url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
});

const viewer = new Cesium.Viewer("cesiumContainer", {
  selectionIndicator: false,
  infoBox: false,
  imageryProvider: imageryProvider,
});

const scene = viewer.scene;
const camera = viewer.camera.position;
let camPos = viewer.camera.positionCartographic;
let latitude;
let longitude;
let windowPosition = "";
let entities = "";
let geoJSONDataList = "";
let objectDetected = false;
let ObjDetected_Long;
let ObjDetected_Lat;
const cssCircleOverlayX = viewer.container.clientWidth / 2;
const cssCircleOverlayY = viewer.container.clientHeight / 2;
const minimumzoomHeight = 2000000;
const maximumzoomHeight = 4000000;
let promise1 = [];

window.onerror = stoperror;
//Disabling timeline and animation widgets
viewer.animation.container.style.visibility = "hidden";
viewer.timeline.container.style.visibility = "hidden";

viewer.forceResize();

//Centering the HTML circle around the point position
document.getElementById("centercircle").style.left = `${
  cssCircleOverlayX - 65
}px`;
document.getElementById("centercircle").style.top = `${
  cssCircleOverlayY - 65
}px`;

//Setting the minimum and maximum zoom in level
viewer.scene.screenSpaceCameraController.minimumZoomDistance =
  minimumzoomHeight;
viewer.scene.screenSpaceCameraController.maximumZoomDistance =
  maximumzoomHeight;

//Loading Screen
const wait = (delay = 0) =>
  new Promise((resolve) => setTimeout(resolve, delay));

const setVisible = (elementOrSelector, visible) =>
  ((typeof elementOrSelector === "string"
    ? document.querySelector(elementOrSelector)
    : elementOrSelector
  ).style.display = visible ? "block" : "none");

setVisible(".page", false);
setVisible("#loading", true);

document.addEventListener("DOMContentLoaded", () =>
  wait(2000).then(() => {
    setVisible(".page", true);
    setVisible("#loading", false);
    setVisible(".datadisplay-inner", true);
    console.log("workiong?");
  })
);

//Read quote lines
const url =
  "https://raw.githubusercontent.com/newtonsalmonjrdev/CesiumWorldMusicGenres/main/musicQuotes.json";
function getFromAPI(url, callback) {
  let obj;
  fetch(url)
    .then((res) => res.json())
    .then((data) => (obj = data))
    .then(() => callback(obj));
}
getFromAPI(url, generateQuotes);

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

async function generateQuotes(quotesObj) {
  const quoteNum = randomNumber(0, 42);
  const quoteDOM = quotesObj[quoteNum].quotes;
  const quoteDOMName = quotesObj[quoteNum].quoteName;
  document.getElementById("quote").innerHTML = quoteDOM;
  document.getElementById("quoteauthor").innerHTML = "~ " + quoteDOMName;
  document.getElementById("quoteauthor").style.color = "darkblue";
}
generateQuotes();

//Loading geoJSON files
function loadJSONPointsPolys() {
  const pointsJSON =
    "https://raw.githubusercontent.com/newtonsalmonjrdev/CesiumWorldMusicGenres/main/Sheet1_Layerexport_PointsP_9.geojson";
  promise1 = Cesium.GeoJsonDataSource.load(pointsJSON);

  promise1.then(function (dataSource1) {
    //Adding Polygon Points, 10 Miles Diameter
    entities = dataSource1.entities.values;
    geoJSONDataList = dataSource1.entities;
    viewer.dataSources.add(
      Cesium.GeoJsonDataSource.load(pointsJSON, {
        stroke: Cesium.Color.fromCssColorString("white"),
        fill: Cesium.Color.fromCssColorString("#00ff82").withAlpha(1),
        strokeWidth: 3,
      })
    );

    //Adding Polygons- to be converted into buffer ellipses, 100 Miles Diameter
    const polygonJSON =
      "https://raw.githubusercontent.com/newtonsalmonjrdev/CesiumWorldMusicGenres/main/buffer_1009_json.geojson";
    const promise2 = Cesium.GeoJsonDataSource.load(polygonJSON);
    promise2.then(function (dataSource2) {
      viewer.dataSources.add(
        Cesium.GeoJsonDataSource.load(polygonJSON, {
          stroke: Cesium.Color.TRANSPARENT,
          fill: Cesium.Color.TRANSPARENT.withAlpha(0.01),
          strokeWidth: 3,
        })
      );
    });
  });
}

//Getting the Cartesian point of the center window position
function getPosition() {
  windowPosition = new Cesium.Cartesian2(
    viewer.container.clientWidth / 2,
    viewer.container.clientHeight / 2
  );

  let pickRay = viewer.scene.camera.getPickRay(windowPosition);
  let pickPosition = viewer.scene.globe.pick(pickRay, viewer.scene);
  let pickPositionCartographic =
    viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition);

  longitude = pickPositionCartographic.longitude * (180 / Math.PI);
  latitude = pickPositionCartographic.latitude * (180 / Math.PI);
}

// This is what's retrieving the cursor's current postion
const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
let handlermove = handler.setInputAction(function (movement) {
  getPosition();
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

function stoperror() {
  return true;
}
stoperror();

// This is retrieving the geoJSON info
function getGeoJSONProps() {
  let handler1 = new Cesium.ScreenSpaceEventHandler(scene.canvas);
  handler1.setInputAction(function () {
    const idlist = [...Array(72).keys()];
    pickedObjects = scene.pick(windowPosition);
    if (Cesium.defined(pickedObjects)) {
      for (let i = 0; i < idlist.length; ++i) {
        if (pickedObjects.id.id === i) {
          //Getting Lat and Long data for fly-to-center function
          objectDetected = true;
          ObjDetected_Long = geoJSONDataList.values[i - 1].properties.Longitude;
          ObjDetected_Lat = geoJSONDataList.values[i - 1].properties.Latitude;
          //Removing Welcome div
          const getWelcomeDiv = document.getElementById("welcomedivID");
          if (typeof getWelcomeDiv != "undefined" && getWelcomeDiv != null) {
            document.getElementById("welcomedivID").remove();
          }

          //Pushing data into the DOM

          //Artist Name
          if (geoJSONDataList.values[i - 1].properties.Artist_Name != "NA") {
            document.getElementById("artistname").innerHTML =
              geoJSONDataList.values[i - 1].properties.Artist_Name;
            document.getElementById("artistname").style.color = "darkblue";
          } else {
            document.getElementById("artistname").innerHTML = "";
          }
          //Band Group
          if (
            geoJSONDataList.values[i - 1].properties.Band_Group__if_any_ != "NA"
          ) {
            document.getElementById("bandgroup").innerHTML =
              geoJSONDataList.values[i - 1].properties.Band_Group__if_any_;
          } else {
            document.getElementById("bandgroup").innerHTML = "";
          }
          //Birth Year
          if (geoJSONDataList.values[i - 1].properties.Birth_Year != "NA") {
            document.getElementById("birthyear").innerHTML =
              geoJSONDataList.values[i - 1].properties.Birth_Year + "&nbsp —";
          } else {
            document.getElementById("birthyear").innerHTML = "";
          }

          //Death Year
          if (geoJSONDataList.values[i - 1].properties.Death_Year != "NA") {
            document.getElementById("deathyear").innerHTML =
              geoJSONDataList.values[i - 1].properties.Death_Year;
          } else {
            document.getElementById("deathyear").innerHTML = "Present";
          }

          // Country of Birth
          if (
            geoJSONDataList.values[i - 1].properties.Country_of_Birth != "NA"
          ) {
            document.getElementById("birthcountry").innerHTML =
              geoJSONDataList.values[i - 1].properties.Country_of_Birth;
            document.getElementById("birthcountry").style.color = "gold";
          } else {
            document.getElementById("birthcountry").innerHTML = "";
          }

          // Primary Genre
          if (geoJSONDataList.values[i - 1].properties.Primary_Genre != "NA") {
            document.getElementById("primarygen").innerHTML =
              geoJSONDataList.values[i - 1].properties.Primary_Genre + "&ensp;";
          } else {
            document.getElementById("primarygen").innerHTML = "";
          }

          // Secondary Genre
          if (
            geoJSONDataList.values[i - 1].properties.Secondary_Genre != "NA"
          ) {
            document.getElementById("secondgen").innerHTML =
              geoJSONDataList.values[i - 1].properties.Secondary_Genre +
              "&ensp;";
          } else {
            document.getElementById("secondgen").innerHTML = "";
          }

          //Tertiary Genre
          if (geoJSONDataList.values[i - 1].properties.Tertiary_Genre != "NA") {
            document.getElementById("tertgen").innerHTML =
              geoJSONDataList.values[i - 1].properties.Tertiary_Genre;
          } else {
            document.getElementById("tertgen").innerHTML = "";
          }

          //Wikipedia
          if (geoJSONDataList.values[i - 1].properties.Wikipedia_Link != "NA") {
            let wikiurl =
              geoJSONDataList.values[i - 1].properties.Wikipedia_Link;
            document.getElementById("wikilink").setAttribute("href", wikiurl);
            document.getElementById("wikilink").innerHTML = "Wikipedia";
          } else {
            document.getElementById("wikilink").innerHTML = "";
          }

          //Youtube
          if (geoJSONDataList.values[i - 1].properties.Youtube != "NA") {
            let youtubeurl = geoJSONDataList.values[i - 1].properties.Youtube;
            document
              .getElementById("youtubelink")
              .setAttribute("href", youtubeurl);
            console.log(geoJSONDataList.values[i - 1].properties);
            document.getElementById("youtubelink").innerHTML = "Youtube";
          } else {
            document.getElementById("youtubelink").innerHTML = "";
          }

          //City of Birth
          if (geoJSONDataList.values[i - 1].properties.City_of_Birth != "NA") {
            document.getElementById("birthcity").innerHTML =
              geoJSONDataList.values[i - 1].properties.City_of_Birth + ", ";
            document.getElementById("birthcity").style.color = "white";
          } else {
            document.getElementById("birthcity").innerHTML = "";
          }

          //Alias
          if (geoJSONDataList.values[i - 1].properties.Alias_Name != "NA") {
            document.getElementById("alias").innerHTML =
              "A.K.A. " + geoJSONDataList.values[i - 1].properties.Alias_Name;
          } else {
            document.getElementById("alias").innerHTML = "";
            document.getElementById("birthcity").style.color = "purple";
          }

          if (geoJSONDataList.values[i - 1].properties.Spotify_Code != "NA") {
            document.getElementById("spotifyiframe").src =
              geoJSONDataList.values[i - 1].properties.SpotifySrc;
          } else {
            document.getElementById("spotifyiframe").src = "";
          }
        } else {
          continue;
        }
      }
      flyToOnClick();
    }
  }, Cesium.ScreenSpaceEventType.LEFT_UP);
}

loadJSONPointsPolys();
getGeoJSONProps();

function flyToOnClick() {
  if (objectDetected) {
    // Get the camera height
    let cameraHeight = viewer.camera._positionCartographic.height;
    // Here position is a Cartesian3 of the camera destination
    const ObjDetectXY = Cesium.Cartesian3.fromDegrees(
      Number(ObjDetected_Long),
      Number(ObjDetected_Lat),
      1000000
    );
    let cartographicDesination = Cesium.Cartographic.fromCartesian(ObjDetectXY);

    // Override its height
    cartographicDesination.height = cameraHeight;
    // Set it back to a Cartesian3, then fly to this destination
    const ObjDetectXYZ = Cesium.Cartographic.toCartesian(
      cartographicDesination
    );
    // Flies to the destination on release of the mouse button
    viewer.camera.flyTo({
      destination: ObjDetectXYZ,
      duration: 2,
      heading: 0,
    });
  }
  const handler2 = new Cesium.ScreenSpaceEventHandler(scene.canvas);
  let handlermove2 = handler.setInputAction(function (movement) {
    scene.camera.cancelFlight();
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
}

viewer.camera.flyTo({
  destination: Cesium.Cartesian3.fromDegrees(
    -77.2975,
    18.1096,
    minimumzoomHeight
  ),
  easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
  duration: 10,
  heading: 0,
});
console.log("© Copyright 2022");
