define(['text!templates/Home.html',
        'views/_zipDistanceFilter',
        'collections/theaterCollection',
        'views/_homeContent',
        'sharedhelpers/configurationProvider',
        'libs/carousel/jquery.carousel.min',
        'sharedhelpers/dateTimeHelper',
        'libs/bootstrap-lightbox/bootstrap-lightbox.min',
        'sharedhelpers/googleapis',
        'sharedhelpers/cachingProvider'
], function (template, zipDistanceFilter, theaterCollection, homeContent, configurationProvider) {
    var view = Backbone.View.extend({
        template: _.template(template),

        vent: _.extend({}, Backbone.Events),

        initialize: function () {
        },

        events: {
            'click .carousel-item': 'refreshTrailerUrl'
        },

        refreshTrailerUrl: function (e) {
            var trailerUrl = $(e.currentTarget).attr("data-trailerurl");
            $("#tubeTrailer").attr("src", trailerUrl);
            $("#movie-trailer").attr("data-trailerurl", trailerUrl + "?autoplay=1");
        },

        render: function () {
            window.AppProperties.SelectedDate = null;
            window.AppProperties.SelectedTheater = null;

            $(this.el).html(this.template());
            this.vent._callbacks = null;

            if (window.singleSite) {
                this.loadSingleTheater();
            } else {
                this.vent.bind("applyZipDistanceFilter", this.applyZipDistanceFilter);
                this.loadZipDistanceFilter(this.options.zipCode, this.options.distance);
            }
            if (window.smallSite) {
                $('#zipDistanceFilterTop').hide();
            }


        },

        loadSingleTheater: function () {
            require(['models/theaterModel'], function (theaterModel) {
                var theaters = new theaterCollection();
                var singleTheaterModel = new theaterModel({ id: configurationProvider.theaterId() });

                singleTheaterModel.getTheater(function (result) {
                    theaters.push(result);
                    window.ObjectCollections.TheaterCollection = theaters;
                    window.ObjectCollections.MovieCollection = theaters.getMovies(null, true);

                    if (window.appConfig.GroupMovies) {
                        window.ObjectCollections.MovieCollection.groupedMovies = window.ObjectCollections.MovieCollection.groupMultiTypeMovies();
                    }

                    hidePageLoadingMessage();

                    $('#homeContent').unbind();
                    var homeContentView = new homeContent({
                        container: "#homeContent",
                        vent: self.vent,
                        movies: window.ObjectCollections.MovieCollection,
                        theaters: window.ObjectCollections.TheaterCollection
                    });

                    homeContentView.render();

                    $('.black-panel').parent().hide();
                });
            });
        },

        loadHomeContent: function (movies, theaters, zipCode) {
            $('#homeContent').unbind();
            var homeContentView = new homeContent({ container: "#homeContent", vent: this.vent, movies: movies, theaters: theaters, zipCode: zipCode });
            homeContentView.render();
        },

        loadZipDistanceFilter: function (zipCode, distance) {
            var that = this;
            var zipDistanceFilterView = new zipDistanceFilter({
                container: "#zipDistanceFilterTop",
                vent: that.vent,
                localize: window.ObjectCollections.Localization.result,
                zipCode: zipCode, distance: distance
            });
            zipDistanceFilterView.render();
        },

        close: function () {
            this.remove();
            this.unbind();
        },

        applyZipDistanceFilter: function (filter) {
            var cache = new CachingProvider();
            var theaters = new theaterCollection();
            theaters.latitude = cache.read("Latitude") || 0;
            theaters.longitude = cache.read("Longitude") || 0;
            theaters.distance = filter.distance;

            showPageLoadingMessage();

            // Retrieve theaters for provided URL
            theaters.fetch({
                error: function () {
                    showAlert(window.ObjectCollections.Localization.result.errorCode16);
                },
                success: function (result) {
                    hidePageLoadingMessage();

                    window.ObjectCollections.TheaterCollection = result;
                    window.ObjectCollections.MovieCollection = result.getMovies(null, true);
                    if (window.appConfig.GroupMovies) {
                        window.ObjectCollections.MovieCollection.groupedMovies = window.ObjectCollections.MovieCollection.groupMultiTypeMovies();
                    }

                    $('#homeContent').unbind();
                    // Re-render the content
                    var homeContentView = new homeContent({
                        container: "#homeContent",
                        vent: self.vent,
                        movies: window.ObjectCollections.MovieCollection,
                        theaters: window.ObjectCollections.TheaterCollection,
                        zipCode: filter.zipCode
                    });

                    homeContentView.render();
                }
            });
        }
    });

    return view;
});