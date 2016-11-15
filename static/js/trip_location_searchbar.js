var tripLoc;
function tripLocSearch(){
    var input = document.getElementById('trip-loc-search');
    var searchBox = new google.maps.places.SearchBox(input);

    
    searchBox.addListener('places_changed', function() {
        tripLoc = searchBox.getPlaces()[0];
        console.log(tripLoc);
        if (tripLoc.length === 0) {
          return;
        }
    });
}
function addTriptoDB(evt){
    evt.preventDefault();
    var latitude = tripLoc.geometry.location.lat();
    var longitude = tripLoc.geometry.location.lng();
    var tripAddress = tripLoc.formatted_address;
    var tripName = $('#tripname').val();
    var toDate = $('#to').val();
    var fromDate = $('#from').val();
    var viewPort = JSON.stringify(tripLoc.geometry.viewport.toJSON());
    
    var params = {
        'tripname': tripName,
        'from': fromDate,
        'to': toDate,
        'latitude': latitude,
        'longitude': longitude,
        'viewport': viewPort,
        'loc-name': tripAddress
    };

    console.log(params);
    $.post('/create_trip.json', params, function(results){
        console.log(results.status);
        window.location.replace("/create_trip/" + results.username +
                                "/" + results.trip_id);
    });
}
$('#create-trip').on('submit', addTriptoDB);