define([
  'text!templates/_map.html',
  'text!templates/InfoWindow.html',
  'async!//maps.googleapis.com/maps/api/js?sensor=false'
], function (template, infoWindowTemplate) {
    var view = Backbone.View.extend({
        el: 'body',

        template: _.template(template),

        render: function () {
            this.el = this.options.container;
            $(this.el).html(this.template());

            var that = this;
            var miles = window.ObjectCollections.Localization.result.miles == window.AppProperties.SearchUnit;

            setTimeout(function () {
                that.getCurrentLocation(function (cords) {

                    var currentLocation = null;
                    if (cords)
                        currentLocation = new google.maps.LatLng(cords.latitude, cords.longitude);

                    var markers = [];

                    var mapOptions = {
                        center: currentLocation,
                        mapTypeControl: true,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        streetViewControl: false,
                        zoomControl: true,
                        zoomControlOptions: {
                            'position': google.maps.ControlPosition.TL,
                            'style': google.maps.ZoomControlStyle.LARGE
                        }
                    };

                    var canvas = $("#div-map")[0];
                    var map = new google.maps.Map(canvas, mapOptions);

                    var bounds = new google.maps.LatLngBounds();

                    _.each(that.options.coordinatesOptions, function (coordinatesOption) {

                        addMarker(new google.maps.LatLng(coordinatesOption.lat, coordinatesOption.lon), coordinatesOption.theaterInfo, null, true);
                        bounds.extend(new google.maps.LatLng(coordinatesOption.lat, coordinatesOption.lon));
                    });

                    if (currentLocation && (currentLocation.jb || currentLocation.kb))
                        addMarker(currentLocation, { theaterName: window.ObjectCollections.Localization.result.youAreHere }, '_green.png', false);

                    function addMarker(latlng, theaterInfo, icon, showInfoWindow) {
                        bounds.extend(latlng);
                        var marker = new google.maps.Marker({
                            position: latlng,
                            map: map,
                            title: theaterInfo.theaterName,
                            icon: "//maps.google.com/mapfiles/marker" + (icon == null ? String.fromCharCode(markers.length + 65) + ".png" : icon)
                        });
                        if (showInfoWindow) {
                            google.maps.event.addListener(marker, 'click', function () {
                                if (marker.infoWindow) {
                                    marker.infoWindow.close();
                                    marker.infoWindow = null;
                                    return;
                                }
                                var theaterAddress = theaterInfo.theaterAddress1 + (theaterInfo.theaterAddress2 || '') + ' ' + theaterInfo.theaterCity + ', ' + theaterInfo.theaterState + ' ' + theaterInfo.theaterZip;
                                var url = '//maps.google.com/maps?daddr=' + theaterAddress;

                                url = encodeURI(url);
                                var infoWindowTmpl = _.template(infoWindowTemplate);

                                var infoWindowContent = infoWindowTmpl({ theaterInfo: theaterInfo, url: url });
                                var infoWindow = new google.maps.InfoWindow({
                                    content: infoWindowContent
                                });
                                infoWindow.content = infoWindowContent;

                                marker.infoWindow = infoWindow;
                                infoWindow.open(map, marker);
                            });
                        }
                        markers.push(marker);
                    }

                    if (that.options.coordinatesOptions.length === 0 && currentLocation) {
                        bounds.extend(currentLocation);
                    }
                    if (window.AppProperties.ShowTheaterDistance || that.options.coordinatesOptions.length === 1) {
                        var radius = window.ConfigurationProvider.searchRadius();

                        map.setCenter(bounds.getCenter());
                        map.setZoom(that.radiusToZoom(miles, radius));
                    }
                    else {
                        map.fitBounds(bounds);
                    }
                });

            }, 300);
        },

        radiusToZoom: function (miles, radius) {
            if (!miles) {
                //Converting kilometers to miles
                radius = radius * 0.621;
            }

            return Math.round(14 - Math.log(radius) / Math.LN2) + 2;
        },

        getCurrentLocation: function (callback) {
            var cache = new CachingProvider();
            var latitude = cache.read("Latitude");
            var longitude = cache.read("Longitude");
            if (latitude && longitude) {
                callback({ latitude: latitude, longitude: longitude });
            }
            else if (navigator.geolocation) {

                var navigatorSuccessCallback = function (position) {
                    callback(position.coords);
                };
                var navigatorErrorCallback = function () {
                    callback(null);
                };

                var navigatorOptions = { enableHighAccuracy: true, timeout: 5000, maximumAge: window.AppProperties.CacheTimeout * 1000 * 1000 };
                navigator.geolocation.getCurrentPosition(navigatorSuccessCallback, navigatorErrorCallback, navigatorOptions);
            }
        }
    });

    return view;
});