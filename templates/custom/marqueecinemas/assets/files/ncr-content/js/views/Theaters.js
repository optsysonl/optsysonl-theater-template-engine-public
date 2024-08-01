define(['text!templates/Theaters.html',
        'collections/theaterCollection',
        'models/theaterModel',
        'collections/scheduleCollection',
        'collections/movieCollection',
        'views/_zipDistanceFilter',
        'views/_topNavigation',
        'views/_schedules',
        'views/_theatersContent',
        'text!templates/_schedules.html',
        'views/_map'

], function (template, theaterCollection, theaterModel, scheduleCollection, movieCollection, zipDistanceFilter, topNavigation, schedules, theatersContent, schedulesTemplate, map) {
    var view = Backbone.View.extend({
        vent: _.extend({}, Backbone.Events),

        template: _.template(template),

        events: {
            'click .theater-item': 'showMovies',
            'click #view-map': 'showMap'
        },

        initialize: function () {
            $(".main-container").unbind();
            this.undelegateEvents();
            _.bindAll(this, "filterScheduleByDate");
            _.bindAll(this, "applyZipDistanceFilter");
        },

        render: function () {
            this.vent._callbacks = null;
            this.vent.bind("applyZipDistanceFilter", this.applyZipDistanceFilter);
            this.vent.bind("dateChanged", this.filterScheduleByDate);

            $(this.el).html(this.template({ localize: window.ObjectCollections.Localization.result }));

            this.loadTopNavigation();
            this.loadZipDistanceFilter(this.options.zipCode, this.options.distance);
            this.loadTheaters(this.options.theaters);

            $("#theaters").children('[theaterId=' + window.AppProperties.SelectedTheater + ']').trigger("click");

            $('html,body').scrollTop(0);

        },
        loadSchedule: function (theaterId, date) {
            var self = this;
            showPageLoadingMessage();

            var businessDate = window.DtHelper.getBussinessDate(new Date(date));
            var schedule = new scheduleCollection({ theaterId: theaterId });
            schedule.getTheaterSchedule(businessDate, function (result) {
                var theater = self.options.theaters.getTheater(theaterId);
                var scheduleView = new schedules({
                    container: "#schedules", showLegend: true, showDateFilter: true, date: date,
                    schedules: new movieCollection(result.models), theaterId: theaterId, schedulesPerLine: 3, showScheduleImage: true, showScheduleData: true, vent: self.vent,
                    theater: theater,
                    schedulesTemplate: schedulesTemplate
                });
                scheduleView.render();

                hidePageLoadingMessage();
            });
        },
        showMap: function () {
            var coordinatesOptions = [];
            _.each(this.options.theaters.models, function (theater) {
                coordinatesOptions.push(
                {
                    lat: theater.get('latitude'),
                    lon: theater.get('longitude'),
                    theaterInfo:
                    {
                        theaterName: theater.get('name'),
                        theaterAddress1: theater.get('addressLine1'),
                        theaterAddress2: theater.get('addressLine2') || '',
                        theaterCity: theater.get("addressCity"),
                        theaterState: theater.get("addressState"),
                        theaterZip: theater.get("addressZip"),
                        theaterPhoneNumber: theater.get("phone")
                    }
                });
            });
            var mapView = new map({ container: "#map_canvas", coordinatesOptions: coordinatesOptions, zoom: 10 });
            mapView.render();
        },
        filterScheduleByDate: function (theaterId) {
            this.loadSchedule(theaterId, window.AppProperties.SelectedDate);
        },

        showMovies: function (e) {
            $('#theaters .selected').removeClass('selected');
            $(e.currentTarget).addClass('selected');

            var theaterId = $(e.currentTarget).attr('theaterid');

            var date;
            if (window.AppProperties.SelectedDate)
                date = window.AppProperties.SelectedDate;
            else
                date = DtHelper.getCurrentBusinessDate();

            $(window).trigger('scroll');
            this.loadSchedule(theaterId, date);
        },

        loadZipDistanceFilter: function (zipCode, distance) {
            var that = this;
            var zipDistanceFilterView = new zipDistanceFilter({
                container: "#zipDistanceFilterTop", vent: that.vent,
                localize: window.ObjectCollections.Localization.result, zipCode: zipCode, distance: distance
            });
            zipDistanceFilterView.render();
        },

        loadTopNavigation: function () {
            var navigation = new Array();
            navigation.push({ isLink: true, name: "Home", href: "#home" });
            navigation.push({ isLink: false, name: "Theaters" });

            var topNavigationView = new topNavigation({ container: "#topNavigation", navigation: navigation, showBackButton: true, localize: window.ObjectCollections.Localization.result });
            topNavigationView.render();

            window.Breadcrumbs = [{ displayName: 'Home', link: "#home" }, { displayName: 'Theaters', link: "#theaters" }];
        },

        loadTheaters: function (theaters) {
            var theatersContentView = new theatersContent({ container: "#theaters", theaters: theaters, localize: window.ObjectCollections.Localization.result });
            theatersContentView.render();
        },

        applyZipDistanceFilter: function (filter) {
            var self = this;
            var cache = new CachingProvider();
            var theaters = new TheaterCollection();
            theaters.latitude = cache.read("Latitude") || 0;
            theaters.longitude = cache.read("Longitude") || 0;
            theaters.distance = filter.distance;


            showPageLoadingMessage();
            // Retrieve theaters for provided URL
            theaters.fetch({
                error: function () {
                    hidePageLoadingMessage();
                },
                success: function (result) {
                    hidePageLoadingMessage();
                    self.options.theaters = result;
                    window.ObjectCollections.TheaterCollection = theaters;
                    window.ObjectCollections.MovieCollection = result.getMovies();

                    if (window.appConfig.GroupMovies) {
                        window.ObjectCollections.MovieCollection.groupedMovies = window.ObjectCollections.MovieCollection.groupMultiTypeMovies();
                    }

                    // Re-render the theaters and schedules
                    var theatersContentView = new theatersContent({ container: "#theaters", theaters: result });
                    theatersContentView.render();

                    var theaterId = window.AppProperties.SelectedTheater || (result.length > 0 ? result.models[0].get('id') : null);

                    if (theaterId) {
                        var date = window.AppProperties.SelectedDate || new Date().toString();
                        self.loadSchedule(theaterId, date);
                    } else {
                        $("#schedules").html("");
                    }
                }
            });
        }
    });

    return view;
});