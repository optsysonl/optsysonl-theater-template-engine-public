define(['text!templates/Movies.html',
        'collections/movieCollection',
        'views/MoviesSub',
        'views/_pagination',
        'views/_zipDistanceFilter',
        'views/_topNavigation',
        'sharedhelpers/castFormatter',
        'sharedhelpers/htmlHelper',
        'sharedhelpers/dateTimeHelper'
], function (template, movieCollection, moviesSubView, paginationView, zipDistanceFilter, topNavigation) {
    var view = Backbone.View.extend({
        template: _.template(template),

        vent: _.extend({}, Backbone.Events),

        initialize: function (arg) {
            _.bindAll(this, 'applyZipDistanceFilter');
            _.bindAll(this, 'applyPagination');

            if (arg) {
                this.localize = arg.localize;
            }
        },

        events: {
            'click #alpha': 'sortEvent',
            'click #dist': 'sortEvent',
            'click .movie-box': 'showMovieDetails'
        },

        groupMovies: function () {
            var that = this;

            var groupedMovies = _.groupBy(that.movies.models, function (model) {
                return model.get('code').trim();
            });

            var newMovies = new Array();
            _.each(groupedMovies, function (items) {
                var movieToShow;
                if (items.length == 1) {
                    movieToShow = items[0];
                } else {
                    if (that.options.sort == "byDistance") {
                        movieToShow = _.min(items, function (item) {
                            if (item.get('nextPerformance')) {
                                return DtHelper.convertDate(item.get('nextPerformance').showTime);
                            }
                        });
                    } else {
                        movieToShow = _.min(items, function (item) {
                            return item.distance;
                        });
                    }
                }

                if (movieToShow) {
                    movieToShow.theaters = _.map(items, function (m) { return m.theaterId; });
                    newMovies.push(movieToShow);
                }
            });

            that.movies.models = newMovies;
        },

        render: function () {
            $(this.el).html(this.template({ sort: this.options.sort, _: _, view: this, localize: this.localize }));

            this.vent._callbacks = null;
            this.vent.bind("applyZipDistanceFilter", this.applyZipDistanceFilter);
            this.vent.bind("applyPagination", this.applyPagination);

            this.loadTopNavigation();
            this.loadZipDistanceFilter();

            $('html,body').scrollTop(0);
        },

        applyZipDistanceFilter: function () {
            var that = this;

            window.AppRouter.populateTheatersAndMovies(function () {
                that.movies = new movieCollection(window.ObjectCollections.MovieCollection.models);

                if (window.appConfig.GroupMovies) {
                    var movieList = [];

                    that.movies.groupedMovies = window.ObjectCollections.MovieCollection.groupMultiTypeMovies();
                    _.each(that.movies.groupedMovies, function (group) {
                        var g = new MovieCollection(group).changeSort('byPerformance');
                        var mov = window.ObjectCollections.MovieCollection.getMovie(g.models[0].get('code'), g.models[0].theaterId);

                        var experienceFilters = window.HtmlHelper.getStandards();
                        for (var i = 0; i < experienceFilters.length; i++) {
                            mov.set(experienceFilters[i].key, group[experienceFilters[i].key]);
                        }

                        var moviePoster = _.find(g.models, function (m) {
                            return m.get('image').medium != undefined;
                        });

                        if (moviePoster) mov.set('image', moviePoster.get('image'));

                        mov.distance = _.min(g.models, function (m) {
                            return m.distance;
                        }).distance;

                        movieList.push(mov);
                    });

                    that.movies.models = movieList;
                } else {
                    that.groupMovies();
                }

                setTimeout(function () {
                    var sort = window.moviesLastSort || 'alpha';
                    that.sort(sort, $("#" + sort).attr('data'));
                    hidePageLoadingMessage();
                }, 500);
            }, true);


        },

        loadZipDistanceFilter: function () {
            var that = this;

            require(['sharedhelpers/cachingProvider'],
                function () {
                    var cache = new CachingProvider();
                    var zipCode = cache.read("ZipCode") || "";
                    var zipDistanceFilterView = new zipDistanceFilter({
                        container: "#zipDistanceFilterTop",
                        vent: that.vent,
                        localize: window.ObjectCollections.Localization.result,
                        distance: window.ConfigurationProvider.searchRadius(),
                        zipCode: zipCode
                    });
                    zipDistanceFilterView.render();
                }
            );
        },

        loadTopNavigation: function () {
            // Prepare navigation data
            var navigation = new Array();
            navigation.push({ isLink: true, name: "Home", href: "#home" });
            navigation.push({ isLink: false, name: "Movies" });

            var topNavigationView = new topNavigation({
                container: "#topNavigation",
                navigation: navigation,
                showBackButton: true,
                localize: window.ObjectCollections.Localization.result
            });
            topNavigationView.render();

            window.Breadcrumbs = [{ displayName: 'Home', link: "#home" }, { displayName: 'Movies', link: "#movies" }];
        },
        sortEvent: function (ev) {
            var element = $(ev.currentTarget);
            var id = element.attr('id');

            window.lastSelectedPage = null;

            this.sort(id, element.attr('data'));

        },
        sort: function (targetId, data) {
            window.moviesLastSort = targetId;
            var that = this;
            if (window.appConfig.GroupMovies) {
                var movies = new movieCollection(that.movies.models);
                movies.changeSort(data);
                that.movies.models = movies.models;
            } else {
                this.movies.changeSort(data);
            }

            if (targetId == "alpha") {
                $('#dist').removeClass('active');
                $('#alpha').addClass('active');
            }
            else {
                $('#alpha').removeClass('active');
                $('#dist').addClass('active');
            };

            setTimeout(function () {
                that.renderPagination(true);
            }, 50);

        },

        showMovieDetails: function (e) {
            var that = this;
            var theaterList = new Array();
            var uniqueCodes = {};
            var uniqueTheaters = {};
            var tmdbId = $(e.currentTarget).attr("data-tmdbid");
            var featureCode = $(e.currentTarget).attr("data-featurecode");

            if (!window.appConfig.GroupMovies) {
                for (var i = 0; i < that.movies.models.length; i++) {
                    var item = that.movies.models[i];
                    if (item.get('code').trim() == featureCode) {
                        theaterList.push(item.theaters);
                    }
                }
            } else {
                _.each(that.movies.groupedMovies, function (group) {
                    for (var i = 0; i < group.length; i++) {
                        var item = group[i];
                        if ((tmdbId && tmdbId != -1 && item.get('tMDBId') && item.get('tMDBId').trim() == tmdbId) || (item.get('code').trim() == featureCode)) {
                            uniqueCodes[item.get('code').trim()] = item.get('code').trim();
                            uniqueTheaters[item.theaterId] = item.theaterId;
                        }
                    }
                });
            }
            if (window.appConfig.GroupMovies) {
                theaterList = _.values(uniqueTheaters).join(',');
                featureCode = _.values(uniqueCodes).join(',');
            }

            Backbone.history.navigate("movie/" + featureCode + "/" + theaterList, { trigger: true, replace: true });
        },

        applyPagination: function (arg) {
            var that = this;
            if (!this.moviesSub) {
                that.moviesSub = new moviesSubView({ container: '#moviesContainer', localize: window.ObjectCollections.Localization.result });
                postBack();

            } else {
                postBack();
            }

            function postBack() {
                that.moviesSub.render({ collection: arg.collection, theaters: window.ObjectCollections.TheaterCollection });
                that.renderPagination(false);
            };
        },

        renderPagination: function (reset) {
            if (!this.paginationView) {
                this.paginationView = new paginationView(
                    {
                        vent: this.vent,
                        perPage: 6,
                        modelConstructor: function (model, newModel) {
                            newModel.theaterId = model.theaterId;
                            newModel.distance = model.distance;
                        }
                    });
            }
            var pagination = this.paginationView.render({ collection: this.movies.filter(), reset: reset });

            $('#paginationTop').html(pagination);
            $('#paginationBootom').html(pagination);
        }
    });

    return view;
});
