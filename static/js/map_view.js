//function to try decoding/encoding utf-8
function encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

function decode_utf8(s) {
  return decodeURIComponent(escape(s));
}

function convertUTF(){

    $('.utf-8').each(function(){
        var decoded = decode_utf8($(this).text());
        $(this).html(decoded);
    });
}



document.onload = function(){
    console.log(document.title);
    var decoded = decode_utf8(document.title);

    console.log(decoded);
    document.title = decoded;
};



var finalMap;
var placesLatLng=[];

// creates a button that centers back to all places
window.allPlacesControl = function(controlDiv, map, bounds) {
    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlDiv.setAttribute("class", "controls" );
    controlDiv.className = "controls";
    controlUI.style.backgroundColor = '#fa8072';
    controlUI.style.borderRadius = '5px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '100px';
    controlUI.style.marginTop = '10px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to see all Places';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = '#fff';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '14px';
    controlText.style.fontWeight = 'bold';
    controlText.style.lineHeight = '24px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'ALL PLACES';
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener('click', function() {
        var latlngbounds = new google.maps.LatLngBounds();
        for (var i = 0; i < bounds.length; i++) {
            latlngbounds.extend(placesLatLng[i]);
        }
        finalMap.fitBounds(latlngbounds);
    });
    // console.log('control button!!!');

};

// create the final map with all of the markers in it
function createAllPlacesMap(results){
    console.log(results);

    var MY_MAPTYPE_ID = 'lighter_base';

    var options = [{
        stylers: [{lightness:35}]
     }];

    finalMap = new google.maps.Map(document.getElementById("final-map"), {
                center: new google.maps.LatLng(0, 0),
                zoom: 0,
                // mapTypeControlOptions: {
                //     mapTypeIds: [google.maps.MapTypeId.ROADMAP, MY_MAPTYPE_ID]
                // },
                zoomControl: true,
                zoomControlOptions: {
              position: google.maps.ControlPosition.RIGHT_CENTER
          },
                mapTypeId: MY_MAPTYPE_ID,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.VERTICAL_BAR,
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
                fullscreenControl: true,
                fullscreenControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_CENTER
                },
                streetViewControlOptions: {
              position: google.maps.ControlPosition.RIGHT_CENTER
          },
            });

    google.maps.event.addDomListener(window, "resize", function() {
       var center = finalMap.getCenter();
       google.maps.event.trigger(finalMap, "resize");
       finalMap.setCenter(center); 
    });
    var styledMapOptions = {
       name: 'Lighten Map'
     };

   var customMapType = new google.maps.StyledMapType(options, styledMapOptions); 

   finalMap.mapTypes.set(MY_MAPTYPE_ID, customMapType);

    // object with the categories and a list for each marker to be added to
    categoryFilterMarkers = {'eat': [],
                             'sleep': [],
                             'explore': [],
                             'transport': []};
    for(var place in results){
        var latLng = new google.maps.LatLng(results[place].latitude, results[place].longitude);
        placesLatLng.push(latLng);

        var content = decode_utf8(results[place].content);
        var dayNum = String(results[place].day_num);

        var category = results[place].category;
        var markerColor;
        switch(category){
            case 'transport':
                markerColor = '#EAC435';
                break;
            case 'eat':
                markerColor = '#D36135';
                break;
            case 'explore':
                markerColor = '#2DB547';
                break;
            case 'sleep':
                markerColor = '#3E8989';
                break;
        }

        var icon = {
        path: "M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z",
        fillColor: markerColor,
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 0.6,
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 0),
        scaledSize: new google.maps.Size(20, 20),
        labelOrigin: new google.maps.Point(0, -28)
      };
        categoryFilterMarkers[category].push(new google.maps.Marker({
            map: finalMap,
            place: {
                location: latLng,
                query: results[place].place_loc
            },
            title: results[place].title,
            
            // position: latLng,
            content: content,
            // icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' +
            //       dayNum + '|' + markerColor + '|000000'
            icon: icon,
            label: {
                text: dayNum,
                color: 'white'
            }
        }));

        test = categoryFilterMarkers[category][categoryFilterMarkers[category].length-1].getVisible();
        console.log(test);
        var infowindow = new google.maps.InfoWindow({
            maxWidth: 300
        });

        google.maps.event.addListener(categoryFilterMarkers[category][categoryFilterMarkers[category].length-1],
                                     'click', function () {
                                infowindow.setContent(this.content);
                                infowindow.open(this.getMap(), this);
                            });
        console.log(categoryFilterMarkers);
    }

    var latlngbounds = new google.maps.LatLngBounds();
    for (var i = 0; i < placesLatLng.length; i++) {
        latlngbounds.extend(placesLatLng[i]);
    }
    finalMap.fitBounds(latlngbounds);

    var allPlacesControlDiv = document.createElement('div');
    allPlacesControlDiv.className = "controls";
    var allPlacesButton  = new allPlacesControl(allPlacesControlDiv, finalMap, placesLatLng);

    allPlacesControlDiv.index = 5;
    finalMap.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(allPlacesControlDiv);

    // createFinalMapPlaces();
    

}

window.createFinalMapPlaces = function(){
    var params = {'trip_id': $('#map-trip_id').val()};
    // send to server which trip you are on and then createAllPlacesMap
    // with information from server.
    $.get('/places_to_map.json', params, createAllPlacesMap);

    // map filters and handle what checking and unchecking does to the map.
    $('.map-filters').on('change', 'input[type="checkbox"]', function () {
        var filter = $(this).val();
        var filter_id = $(this).attr('id');
        var filter_cat = filter_id.split('-')[0];
        console.log(filter_cat);
        for (i = 0; i < categoryFilterMarkers[filter_cat].length; i++) {
            //Test to see if the entry matches, for now we'll just make it random to illustrate the concept
            //e.g. if(filter in sites[i].attrs)
            if(categoryFilterMarkers[filter_cat][i].getVisible()) {
                categoryFilterMarkers[filter_cat][i].setVisible(false);
            } else {
                categoryFilterMarkers[filter_cat][i].setVisible(true);
            }
        }
    });
    document.onload();
    convertUTF();

};


// on document load, create the final map.
// $(document).ready(function(){
//     createFinalMapPlaces();
    

// });


// document.getElementById("copyButton").addEventListener("click", function() {
//     copyToClipboard(document.getElementById("copyTarget"));
// });


// // copy link to clipboard
// function copyToClipboard(elem) {
//       // create hidden text element, if it doesn't already exist
//     var targetId = "_hiddenCopyText_";
//     var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
//     var origSelectionStart, origSelectionEnd;
//     if (isInput) {
//         // can just use the original source element for the selection and copy
//         target = elem;
//         origSelectionStart = elem.selectionStart;
//         origSelectionEnd = elem.selectionEnd;
//     } else {
//         // must use a temporary form element for the selection and copy
//         target = document.getElementById(targetId);
//         if (!target) {
//             var target = document.createElement("textarea");
//             target.style.position = "absolute";
//             target.style.left = "-9999px";
//             target.style.top = "0";
//             target.id = targetId;
//             document.body.appendChild(target);
//         }
//         target.textContent = elem.textContent;
//     }
//     // select the content
//     var currentFocus = document.activeElement;
//     target.focus();
//     target.setSelectionRange(0, target.value.length);
    
//     // copy the selection
//     var succeed;
//     try {
//           succeed = document.execCommand("copy");
//     } catch(e) {
//         succeed = false;
//     }
//     // restore original focus
//     if (currentFocus && typeof currentFocus.focus === "function") {
//         currentFocus.focus();
//     }
    
//     if (isInput) {
//         // restore prior selection
//         elem.setSelectionRange(origSelectionStart, origSelectionEnd);
//     } else {
//         // clear temporary content
//         target.textContent = "";
//     }
//     return succeed;
// }

