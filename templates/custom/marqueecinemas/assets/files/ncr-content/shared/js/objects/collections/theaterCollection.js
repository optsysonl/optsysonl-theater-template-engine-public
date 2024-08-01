define(["models/theaterModel", "collections/movieCollection", 'sharedhelpers/configurationProvider', 'sharedhelpers/errorHelper'],
        function (theaterModel, movieCollection, configurationProvider) {
            var theaterCount = 10;
            window.TheaterCollection = BaseCollection.extend({
                model: theaterModel,
                postalCode: "",
                latitude: "",
                longitude: "",
                distance: 25,
                theaterCount: theaterCount,
                sortParameter: "",

                initialize: function () {
                    if (window.ChainInfo != null)
                        this.distance = window.ChainInfo.defaultSearchRadius();
                },
                // alphabetic and by distance
                strategies: {
                    byName: function (theater) { return theater.get("name"); },
                    byDistance: function (theater) { return theater.get("distance"); }
                },

                changeSort: function (sortProperty) {
                    this.comparator = this.strategies[sortProperty];
                    this.sort();
                },

                getAllTheaterLocations: function () {
                    var locations = [];
                    _.each(window.ObjectCollections.TheaterCollection.models, function (model) {
                        locations.push({ name: model.get('name'), coords: model.coords, theaterId: model.id });
                    });
                    return locations;
                },

                getMovies: function (sort, skipSorting) {
                    var movies = new movieCollection();
                    _.each(this.models, function (theater) {
                        _.each(theater.movies.models, function (movie) {
                            movie.theaterId = theater.get('id');
                            movie.distance = theater.get('distance');
                            movie.theaterName = theater.get('name') + ' ' + theater.get('addressCity');
                            movie.theaterCulture = theater.get('culture');
                            movie.attachPerformances();
                            movies.add(movie);
                        });
                    });

                    if (skipSorting) {
                        return movies;
                    }

                    // Default sorting by name/title
                    if (!sort)
                        sort = window.AppConfig.DefaultMovieSort || "byName";
                    movies.comparator = movies.strategies[sort];
                    movies.sort();

                    return movies;
                },

                getTheaters: function (lat, lng, callback) {

                    this.latitude = lat;
                    this.longitude = lng;
                    this.fetch({
                        success: function (result) {
                            callback(result);
                        },
                        error: function () {
                            callback();
                        }
                    });
                },

                parse: function (resp) {
                    this.result_code = resp.result_code;

                    return resp.result;
                },

                getAllShowDates: function () {
                    var availableDates = [];
                    _.each(this.models, function (theater) {
                        var showDates = theater.get('showDates');
                        if (showDates) {
                            for (var j = 0; j < showDates.length; j++) {
                                availableDates.push(showDates[j]);
                            }
                        }
                    });
                    return availableDates;
                },

                getTheater: function (theaterId) {
                    return _.find(this.models, function (theater) { return theater.get('id') == theaterId; });
                },

                getHomeTheaters: function (callback) {
                    var that = this;
                    that.fetch({
                        url: that.homeUrl(),
                        success: function (result) {
                            callback(result);
                        },
                        error: function () {
                            callback();
                        }
                    });
                },

                homeUrl: function () {
                    var that = this;

                    if (that.theaterIds.length == 0 && !that.latitude && !that.longitude) {
                        var searchUnit = window.ChainInfo.defaultSearchRadiusIsInMiles() ? 'miles' : 'kilometers';

                        return that.RESTUri + 'theaters/' + that.latitude + '/' + that.longitude + '/top/3/' + searchUnit;
                    }

                    var url = that.RESTUri + 'theaters?theaterIds=' + that.theaterIds.join(',') + '&latitude=' + that.latitude + '&longitude=' + that.longitude;

                    return url;
                },

                url: function () {
                    var that = this;

                    var searchUnit = window.ChainInfo.defaultSearchRadiusIsInMiles() ? 'miles' : 'kilometers';

                    if (window.isMobileDevice() && window.AppProperties.searchRadius)
                        this.distance = window.AppProperties.searchRadius;

                    if (!this.distance)
                        this.distance = '25';

                    var request = that.RESTUri + 'theaters/' + that.latitude + '/' + that.longitude + '/top/' + that.theaterCount + '/' + searchUnit;

                    if (window.isMobileDevice() && !window.AppConfig.EnableAlternateFeatures) {
                        request += '/' + (configurationProvider.getFindTheatersNumberOfWeeks() || 0) + '/weeks/nodetail';
                    }

                    //Check if this is called from mobile device and if current position is allowed and if user did not use search by Zip or City                  
                    if (configurationProvider.chainType() == 'small') {
                        return request;
                    }

                    if (window.isMobileDevice() && window.AppProperties.CurrentPosition.Latitude == 0 && window.AppProperties.CurrentPosition.Longitude == 0 && !window.AppProperties.CityOrZip) {
                        return request;
                    }

                    if (!window.isMobileDevice() && that.latitude == 0 && that.longitude == 0) {
                        return request;
                    }

                    request = that.RESTUri + 'theaters/' + that.latitude + '/' + that.longitude + '/' + that.distance + '/' + searchUnit;

                    if (window.isMobileDevice() && !window.AppConfig.EnableAlternateFeatures) {
                        request += '/' + (configurationProvider.getFindTheatersNumberOfWeeks() || 0) + '/weeks/nodetail';
                    }

                    return request;
                }
            });

            return window.TheaterCollection;
        });