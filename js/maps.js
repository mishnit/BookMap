function Map()
{
}

Map.displayMap = function(userPosition, objectPosition, idMapCanvas)
{
    var userLatLng = null;
    var objectLatLng = null;

    if (userPosition != null)
        userLatLng = new google.maps.LatLng(userPosition.coords.latitude, userPosition.coords.longitude);
    if (objectPosition != null)
        objectLatLng = new google.maps.LatLng(objectPosition.position.latitude, objectPosition.position.longitude);

    var mapDiv = document.getElementById(idMapCanvas);
    var mapOptions = {
        zoom: 17,
        center: userLatLng
    }

    var map = new google.maps.Map(mapDiv, mapOptions);
    var marker = new google.maps.Marker({
        map: map,
        position: userLatLng,
        icon: "img/pin-blue-12.png",
        title: "Your position"
   });

    var circle = new google.maps.Circle({
        map: map,
        center: userLatLng,
        radius: userPosition.coords.accuracy,
        strokeColor: "#2ad",
        strokeOpacity: 0.8,
        fillColor: "#a7ddf1",
        fillOpacity: 0.35
    });
    map.fitBounds(circle.getBounds());

    if (objectLatLng != null)
    {
        marker = new google.maps.Marker({
            map: map,
            position: objectLatLng,
            icon: "img/pin-red-12.png",
            title: "Your Destination"
        });
        
        circle = new google.maps.Circle({
            map: map,
            center: objectLatLng,
            radius: objectPosition.position.accuracy,
            strokeColor: "#e74c3c",
            strokeOpacity: 0.8,
            fillColor: "#f5b7b1",
            fillOpacity: 0.35
        });

        options = {
            map: map,
            suppressMarkers: true,
            preserveViewport: true
        }
        this.setRoute(new google.maps.DirectionsRenderer(options), userLatLng, objectLatLng);
    }
    $.mobile.loading("hide");
}

Map.setRoute = function(directionsDisplay, userLatLng, objectLatLng)
{
    var directionsService = new google.maps.DirectionsService();
    var request = {
        origin: userLatLng,
        destination: objectLatLng,
        travelMode: google.maps.DirectionsTravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.METRIC
    };

    directionsService.route(
        request,
        function(response, status)
        {
            if (status == google.maps.DirectionsStatus.OK)
                directionsDisplay.setDirections(response);
            else
            {
                navigator.notification.alert(
                    "Unable to retrieve a route to your destination.",
                    function(){},
                    "Warning"
                );
            }
        }
    );
}

Map.requestLocation = function(position, positionName)
{
    new google.maps.Geocoder().geocode(
        {
            "location": new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
        },
        function(results, status)
        {
            if (status == google.maps.GeocoderStatus.OK)
            {
                var positions = new Position();
                positions.updatePosition(0, positions.getPositions()[0].coords, results[0].formatted_address, positionName);
            }
        }
    );
}