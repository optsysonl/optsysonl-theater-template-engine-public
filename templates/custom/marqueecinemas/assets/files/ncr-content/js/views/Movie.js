define(['text!templates/Movie.html',
        'models/movieModel',
        'collections/facebookFriendCollection',
        'collections/movieScheduleCollection',
        'views/_topNavigation',
        'views/_datePicker',
        'views/_zipDistanceFilter',
        'views/_map',
        'views/_movieDetailsSchedules',
        'collections/theaterCollection',
        'sharedhelpers/configurationProvider',
        'text!templates/_zipDistanceFilterInline.html',
        'dateFormat',
        'sharedhelpers/dateTimeHelper',
        'bootstrap',
        'sharedhelpers/cachingProvider',
        'libs/datepicker/js/bootstrap-datepicker',
        'async!//maps.googleapis.com/maps/api/js?sensor=false',
        'libs/bootstrap-lightbox/bootstrap-lightbox.min',
        'sharedhelpers/castFormatter',
        'sharedhelpers/htmlHelper'

], function (template, movieModel, facebookFriendCollection, movieScheduleCollection, topNavigation,
             datePicker, zipDistanceFilter, map, movieDetailsSchedules, theaterCollection, configurationProvider, zipDistanceFilterTemplate) {

    var view = Backbone.View.extend({
        template: _.template(template),

        vent: _.extend({}, Backbone.Events),

        events: {
            'click .view-map': 'showMap',
            'click #facebook-share': 'fbShareConfirm',
            'click #movie-trailer': 'playMovie'
        },

        initialize: function () {
            var that = this;

            if (!that.options.model) {
                showAlert(window.ObjectCollections.Localization.result.movieLinkNotValid, {
                    postBack: function () {
                        Backbone.history.navigate('home', { trigger: true });
                    }
                });
                return;
            }

            that.availableDates = that.options.model.getAvailableShowDates();
            that.currentDate = window.AppProperties.SelectedDate || DtHelper.getCurrentBusinessDate();
            that.theaterIds = that.options.theaterId.toLowerCase().split(',');

            that.undelegateEvents();
            _.bindAll(that, 'renderAll');
            _.bindAll(that, 'filterScheduleByDate');
            _.bindAll(that, 'applyZipDistanceFilter');
        },

        playMovie: function (e) {
            $("#tubeTrailer").attr("src", $(e.currentTarget).attr("data-trailerurl") + "?autoplay=1");
        },
        handleNoAvailableTheaters: function () {
            var miles = window.ConfigurationProvider.searchRadius();
            $('#theaters-schedules').empty();
            $('#theaters-schedules').html('<h4>' + window.ObjectCollections.Localization.result['noAvailableSchedules'].replace('%s', miles) + '</h4>');

            hidePageLoadingMessage();
        },
        handleNoAvailableShowtimes: function () {
            var miles = window.ConfigurationProvider.searchRadius();
            $('#theaters-schedules').empty();
            $('#theaters-schedules').html('<h4>' + window.ObjectCollections.Localization.result['noAvailableShowtimes'].replace('%s', miles) + '</h4>');

            hidePageLoadingMessage();
        },
        render: function () {
            this.vent._callbacks = null;
            this.vent.bind("dateChanged", this.filterScheduleByDate);
            this.vent.bind("applyZipDistanceFilter", this.applyZipDistanceFilter);

            this.renderAll();

            $(".cast").castFormatter();

            $(".separator").hide();
            $('html,body').scrollTop(0);
        },

        renderAll: function () {
            if (!this.model)
                return;

            $('.datepicker').remove();
            $('.datepicker').unbind();

            this.overrideTheaters = true;

            var that = this;

            var callback = function () {
                $(that.el).html(that.template({ movie: that.model, localize: window.ObjectCollections.Localization.result }));

                var movieName = that.model.get("name");
                if (window.appConfig.GroupMovies && that.model.get("tMDBName")) {
                    movieName = that.model.get("tMDBName");
                }

                that.loadTopNavigation(movieName);

                var cache = new CachingProvider();
                var postalCode = cache.read("ZipCode") || "";
                var distance = window.ConfigurationProvider.searchRadius();
                that.loadZipDistanceFilter(postalCode, distance);

                if (window.singleSite || window.smallSite) {
                    $('.searchBar').hide();
                    $('.miles').parent().hide();
                }
            };

            if (window.ObjectCollections.MovieCollection.models.length == 0) {
                that.getTheaters(100, callback);
            } else {
                callback();
            }
        },

        loadGroupExperienceFeatures: function (movieGroup) {
            //handle group experience filters
            var experienceFilters = window.HtmlHelper.getStandards();
            for (var i = 0; i < experienceFilters.length; i++) {
                this.options.model.set(experienceFilters[i].key, movieGroup[experienceFilters[i].key]);
            }
        },

        getTheaters: function (distance, callback) {
            var that = this;

            var cache = new CachingProvider();
            var theaters = new TheaterCollection();
            theaters.latitude = cache.read("Latitude") || 0;
            theaters.longitude = cache.read("Longitude") || 0;
            theaters.distance = distance;

            showPageLoadingMessage();

            if (window.singleSite) {
                require(['models/theaterModel'], function (theaterModel) {
                    var theater = new theaterModel({ id: window.ConfigurationProvider.theaterId() });
                    theater.getTheater(function (result) {
                        result = new TheaterCollection(result);
                        window.ObjectCollections.MovieCollection = result.getMovies();

                        if (callback) {
                            callback();
                        }
                    }, function () {
                        hidePageLoadingMessage();
                    });
                });
                return;
            }

            theaters.fetch({
                error: function () {
                    hidePageLoadingMessage();
                },
                success: function (result) {
                    //Prevent potential emptying of the theater collection on initial page load
                    if (!that.overrideTheaters || result && result.length > 0) {
                        window.ObjectCollections.TheaterCollection = result;
                        window.ObjectCollections.MovieCollection = result.getMovies();
                    }

                    if (callback) {
                        callback();
                    }
                }
            });
        },

        loadTheatersAndSchedules: function (theaters, movieCode, filterDate) {
            var now = new Date().toISOString();

            var sortedTheaters = _.sortBy(theaters, function (t) {
                //Grouped movies will have performances in their group property
                var performances = t.performances;
                if (t.group) {
                    performances = _.map(t.group, function (g) {
                        return g.performances;
                    });

                    performances = _.flatten(performances);
                }

                var performanceCount = 0;

                _.each(performances, function (performance) {
                    if (performance.businessDate === window.DtHelper.getBussinessDate(filterDate) && new Date(performance.showTime).toISOString() > now) {
                        performanceCount++;
                    }
                });

                return performanceCount == 0 ? 1 : -1;
            });

            if (window.singleSite) {
                sortedTheaters = _.filter(sortedTheaters, function (t) {
                    var theater = t.theater || t;
                    return theater.id.toUpperCase() == configurationProvider.theaterId().toUpperCase();
                });
            }


            var defaultTheater = sortedTheaters.length > 0 ? sortedTheaters[0].theater || sortedTheaters[0] : null;
            this.loadDatePicker(window.DtHelper.getCurrentBusinessDate(), defaultTheater ? defaultTheater.get('culture') : window.AppConfig.AppCulture);

            var movieDetailsSchedulesView = new movieDetailsSchedules({ container: "#theaters-schedules", theaters: sortedTheaters, movieCode: movieCode, filterDate: filterDate, movie: this.options.model });
            movieDetailsSchedulesView.render();

            hidePageLoadingMessage();
        },

        filterScheduleByDate: function () {
            var that = this;

            // sort theaters by distance
            that.currentDate = window.AppProperties.SelectedDate;

            var cache = new CachingProvider();
            var distance = cache.read("Distance");
            var zip = cache.read("ZipCode");
            if (distance && zip) {
                that.applyZipDistanceFilter({ distance: distance });
            } else {
                showPageLoadingMessage();

                //Delaying to show the loader
                _.delay(function () {
                    var theaters = that.model.theaters.sort(function (a, b) {
                        var ath = a.theater || a;
                        var bth = b.theater || b;
                        return (ath.get("distance") < bth.get("distance")) ? -1 : 1;
                    });

                    that.loadTheatersAndSchedules(theaters, that.model.get("code"), that.currentDate);
                }, 200);
            }
        },

        applyZipDistanceFilter: function (filter) {
            var self = this;

            if (!window.singleSite) {
                $("#zipDistanceFilterTop").html("");
            }

            showPageLoadingMessage();

            self.getTheaters(filter.distance, function () {
                var theaters = window.ObjectCollections.TheaterCollection;
                var selectedTheaters = self.overrideTheaters ? self.theaterIds : _.map(theaters.models, function (t) { return t.id; });
                self.overrideTheaters = false;

                if (selectedTheaters.length == 0) {
                    self.handleNoAvailableTheaters();
                    return;
                }

                if (window.appConfig.GroupMovies) {
                    self.getMovieGroup(theaters, selectedTheaters);
                } else {
                    self.getMovies(theaters, selectedTheaters);
                }
            });
        },

        getMovies: function (theaters, selectedTheaters) {
            var self = this;

            var schedule = new movieScheduleCollection({ featureCode: self.options.featureCode, theaterId: selectedTheaters.join(',') });
            schedule.getMovieSchedule(function (res) {
                if (res.models && res.models.length > 0 && res.models[0].get("schedules")) {
                    self.model = res.models[0];

                    // connect with theaters
                    _.each(res.models[0].get("schedules"), function (model) {
                        model.theater = theaters.get(model.theaterId);
                    });

                    // now copy this to theaters property
                    self.model.theaters = _.filter(res.models[0].get("schedules"), function (t) {
                        return $.inArray(t.theaterId, selectedTheaters) >= 0;
                    });

                    if (!self.model.theaters[0].theater) {
                        self.handleNoAvailableShowtimes();
                        return;
                    }

                    // sort theaters by distance
                    var sortedTheaters = self.model.theaters.sort(function (a, b) { return (a.theater.get("distance") < b.theater.get("distance")) ? -1 : 1; });
                    self.loadTheatersAndSchedules(sortedTheaters, self.model.get("code"), self.currentDate);
                } else {
                    self.handleNoAvailableTheaters();
                }
            }, self.handleNoAvailableTheaters);
        },

        getMovieGroup: function (theaters, selectedTheaters) {
            var self = this;

            window.ObjectCollections.MovieCollection.groupedMovies = window.ObjectCollections.MovieCollection.groupMultiTypeMovies();

            require(['collections/movieCollection'], function (movieCollection) {
                var movies = new movieCollection();
                movies.getMovieSchedule('', selectedTheaters.join(','), function (res) {
                    if (!res || !res.models || res.models.length == 0) {
                        self.handleNoAvailableTheaters();
                        return;
                    }

                    var movieGroup = window.ObjectCollections.MovieCollection.getMovieGroup(self.options.featureCode);

                    movieGroup = _.filter(movieGroup, function (g) {
                        return $.inArray(g.theaterId, selectedTheaters) >= 0;
                    });

                    if (movieGroup.length == 0) {
                        self.handleNoAvailableShowtimes();
                        return;
                    }

                    self.loadGroupExperienceFeatures(movieGroup);

                    //get the schedule model for each movie in the group
                    _.each(res.models, function (mod) {
                        _.each(movieGroup, function (mov) {
                            if (mov.get('code').trim() == mod.get('code').trim()) {
                                mov.schedule.models = _.filter(mod.schedule.models, function (m) {
                                    return m.get('theaterId') == mov.theaterId;
                                });
                                if (mov.schedule.models.length > 0) {
                                    mov.performances = mov.schedule.models[0].get('performances');
                                }
                            }
                        });
                    });

                    //filter movies from the group by theaters
                    _.each(theaters.models, function (th) {
                        th.group = _.filter(movieGroup, function (mov) {
                            return th.id == mov.theaterId;
                        });
                        _.each(movieGroup, function (m) {
                            if (m.theaterId == th.id) {
                                th.set('distance', m.distance);
                            }
                        });
                    });

                    self.model.theaters = _.reject(theaters.models, function (t) {
                        return t.group.length == 0;
                    });

                    var sortedTheaters = self.model.theaters.sort(function (a, b) { return (a.get("distance") < b.get("distance")) ? -1 : 1; });;
                    self.loadTheatersAndSchedules(sortedTheaters, self.model.get("code"), self.currentDate);
                }, self.handleNoAvailableTheaters);
            });
        },

        loadZipDistanceFilter: function (zipCode, distance) {
            var that = this;

            var zipDistanceFilterView = new zipDistanceFilter({
                container: "#zipCodeDistanceFilter",
                vent: that.vent,
                localize: window.ObjectCollections.Localization.result,
                zipCode: zipCode, distance: distance
            });
            zipDistanceFilterView.template = _.template(zipDistanceFilterTemplate);
            zipDistanceFilterView.render(that.preventFilter);
        },

        loadTopNavigation: function (movieName) {
            var navigation = new Array();
            if (window.Breadcrumbs.length > 0) {
                _.each(window.Breadcrumbs, function (breadcrumb) {
                    navigation.push({ isLink: true, name: breadcrumb.displayName, href: breadcrumb.link });
                });
            }
            else {
                navigation.push({ isLink: true, name: "Home", href: "#home" });
                navigation.push({ isLink: true, name: "Movies", href: "#movies" });
                window.Breadcrumbs = [{ displayName: 'Home', link: "#home" }, { displayName: 'Movies', link: "#movies" }];
            }

            navigation.push({ isLink: false, name: movieName });

            var topNavigationView = new topNavigation({ container: "#topNavigation", navigation: navigation, showBackButton: true, localize: window.ObjectCollections.Localization.result });
            topNavigationView.render();
        },

        loadDatePicker: function (date, culture) {
            var datePickerView = new datePicker({ container: "#schedule-date-filter", date: date, vent: this.vent, hideDatePicker: false, culture: culture });
            datePickerView.render(this.availableDates);
        },

        showMap: function (e) {
            if (window.ObjectCollections.TheaterCollection) {
                var theater = window.ObjectCollections.TheaterCollection.where({ id: $(e.currentTarget).data('theater-id') })[0];
                var coordinatesOptions = [];
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

                var mapView = new map({ container: "#map_canvas", coordinatesOptions: coordinatesOptions, zoom: 13 });
                mapView.render();
            }
        },

        fbShareConfirm: function () {
            var that = this;
            if (typeof FB != 'undefined' && FB) {
                FB.getLoginStatus(function (response) {
                    if (response && response.status == 'connected') {
                        end();
                    } else {
                        FB.login(checkLoginStatus);
                    }
                });
            } else {
                showAlert(window.ObjectCollections.Localization.result.unableToConnect);
            }

            function checkLoginStatus(response) {
                if (response.status == 'connected') {
                    showAlert(window.ObjectCollections.Localization.result.loggedInFb, { postBack: end });
                } else {
                    showAlert(window.ObjectCollections.Localization.result.unableToConnect);
                }
            };

            function end() {
                if (!window.ObjectCollections.FacebookFriendCollection) {
                    var c = new FacebookFriendCollection();
                    window.ObjectCollections.FacebookFriendCollection = c;
                };
                var localize = window.ObjectCollections.Localization.result;
                var name = that.model.get('name');
                var link = window.appConfig.SiteURL + location.hash;
                var picture = that.model.get('image') ? (that.model.get('image').medium || window.appConfig.DefaultMoviePosterImage) : window.appConfig.DefaultMoviePosterImage;
                var caption = localize.confirmationMovie;

                var personalMessage = localize.imGoingToSee + " " + that.model.get('name');

                window.ObjectCollections.FacebookFriendCollection.shareToWall(name, caption, personalMessage, link, picture, function (response) {
                    if (response && response.post_id) {
                        showAlert(window.ObjectCollections.Localization.result.postSuccessful);
                    }
                });
            };
        }
    });

    return view;
});