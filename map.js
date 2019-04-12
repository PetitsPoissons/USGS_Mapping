// URLs for USGS data (all earthquakes from the past seven days) and faultlines data:
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var faultlinesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Load the geoJson earthquakes data and create the earthquakes layer
d3.json(earthquakesURL).then (data => createEarthquakesLayer(data.features));

// Function to create the earthquakes layer
function createEarthquakesLayer(features) {

    var earthquakeMarkers = [];
    features.forEach(feature => {
        earthquakeMarkers.push(
            L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0], feature.geometry.coordinates[2]], {
                stroke: false,
                color: getColor(feature.properties.mag),
                fillColor: getColor(feature.properties.mag),
                fillOpacity: 0.9,
                radius: getRadius(feature.properties.mag)
            }).bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`)
        )
    });

    var earthquakesLayer = L.layerGroup(earthquakeMarkers);
    //earthquakesLayer.addTo(myMap);
    createPlatesLayer(earthquakesLayer);
}

// Create the fault lines layer
function createPlatesLayer(earthquakesLayer) {

    d3.json(faultlinesURL).then( data => {
    
        // Extract all plates boundaries info
        var faultlinesLayer = L.geoJSON(data, {
            style: function (feature) {
                return {
                    color: 'orange',
                    fillColor: 'none',
                    weight: 2
                };
            }
        });
        //earthquakesLayer.addTo(myMap);
        //faultlinesLayer.addTo(myMap);
        createMap(earthquakesLayer, faultlinesLayer);
    });
}

function createMap(earthquakesLayer, faultlinesLayer) {

    // Define satellite, grayscale, and outdoors layers
    var satelliteLayer = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });
    var grayscaleLayer = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });
    var outdoorsLayer = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold the base layers
    var baseMaps = {
        "satellite": satelliteLayer,
        "grayscale": grayscaleLayer,
        "outdoors": outdoorsLayer
    };

    // Create an overlayMaps object to hold the overlay layers
    var overlayMaps = {
        "Earthquakes": earthquakesLayer,
        "Fault Lines": faultlinesLayer
    };

    // Create the map, giving it the satellite, earthquakes and faultlines layers to display on load
    var myMap = L.map("map", {
        center: [37.0902, -95.7129],
        zoom: 3,
        layers: [satelliteLayer, earthquakesLayer, faultlinesLayer]
    });

    // Create a layer control and add to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create legend
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function () {
    
        var div = L.DomUtil.create('div', 'info legend');
        var labels = ['<strong>Magnitudes</strong>'];
        var categories = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+'];
        var magnitudes = [0, 1, 2, 3, 4, 5];
        for (var i = 0; i < categories.length; i++) {
            div.innerHTML += 
                labels.push(
                    '<i style="background:' + getColor(magnitudes[i]) + '"></i>' +
                (categories[i] ? categories[i] : '+'));
            }
        div.innerHTML = labels.join('<br>');
        return div;
    };
    legend.addTo(myMap);

}


/* HELPER FUNCTIONS */

// Function to get the color of the circle markers depending on the magnitude of the earthquake
function getColor(magnitude) {
    var color;
    //var sizeAmplifier;
    if (magnitude >= 5) {
        color = '#d73027';
    } else if (magnitude >= 4) {
        color = '#fc8d59';
    } else if (magnitude >= 3) {
        color = '#fee08b';
    } else if (magnitude >= 2) {
        color = '#d9ef8b';
    } else if (magnitude >= 1) {
        color = '#91cf60';
    } else {
        color = '#1a9850';
    }
    return color;
}

// Function to get the radius of the circle markers depending on the magnitude of the earthquake
function getRadius(magnitude) {
    var radius;
    //var sizeAmplifier;
    if (magnitude >= 5) {
        //color = '#d73027';
        radius = magnitude * 35000;
    } else if (magnitude >= 4) {
        //color = '#f46d43';
        radius = magnitude * 30000;
    } else if (magnitude >= 3) {
        //color = '#fdae61';
        radius = magnitude * 25000;
    } else if (magnitude >= 2) {
        //color = '#fee08b';
        radius = magnitude * 20000;
    } else if (magnitude >= 1) {
        //color = '#d9ef8b';
        radius = magnitude * 15000;
    } else {
        //color = '#a6d96a';
        radius = magnitude * 10000;
    }
    return radius;
}
