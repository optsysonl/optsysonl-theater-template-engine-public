function getCoordinates(address, callback)
{
      var geocoder = new google.maps.Geocoder();
               geocoder.geocode({ 'address': address }, function (results, status) {
               if (status == google.maps.GeocoderStatus.OK) {
                     callback({ lat: results[0].geometry.location.lat(), lon: results[0].geometry.location.lng() });
               }
               else {
                     console.log("Failed retreiving coordinates: " + status);
                     callback(undefined);
               }
     });
}