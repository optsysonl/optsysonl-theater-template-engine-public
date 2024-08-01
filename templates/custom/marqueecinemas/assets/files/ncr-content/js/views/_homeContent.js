define(['text!templates/_homeContent.html',
        'collections/movieCollection',
        'sharedhelpers/htmlHelper'],
    function (template, movieCollection) {
        var view = Backbone.View.extend({
            el: 'body',

            template: _.template(template),

            initialize: function () {
                this.localize = window.ObjectCollections.Localization.result;
                this.vent = this.options.vent;
            },
            render: function () {
                this.el = this.options.container;
                var uniqueMovies = [];

                if (window.appConfig.GroupMovies) {
                    _.each(window.ObjectCollections.MovieCollection.groupedMovies, function (group) {
                        var g = new MovieCollection(group).changeSort('byPerformance');
                        var mov = window.ObjectCollections.MovieCollection.getMovie(g.models[0].get('code'), g.models[0].theaterId);

                        var popularity = 0;
                        _.each(g.models, function (m) {
                            popularity += m.get('totalPerformanceCount');
                        });

                        mov.set('totalPerformanceCount', popularity);

                        var moviePoster = _.find(g.models, function (m) {
                            return m.get('image').medium != undefined;
                        });

                        if (moviePoster) {
                            mov.set('image', moviePoster.get('image'));

                            var experienceFilters = window.HtmlHelper.getStandards();
                            for (var i = 0; i < experienceFilters.length; i++) {
                                mov.set(experienceFilters[i].key, group[experienceFilters[i].key]);
                            }

                            uniqueMovies.push(mov);
                        }

                    });
                } else {
                    // Remove Movies with no image and limit to 20
                    var filteredMovies = new movieCollection();

                    for (var i = 0; i < this.options.movies.models.length; i++) {
                        if (this.options.movies.models[i].get("image")["medium"]) {
                            filteredMovies.add(this.options.movies.models[i]);
                        }
                    }

                    _.each(filteredMovies.models, function (movie) {
                        var addedMovie = _.find(uniqueMovies, function (item) {
                            return $.trim(item.get('code')) == $.trim(movie.get('code'));
                        });

                        if (!addedMovie) {
                            uniqueMovies.push(movie);
                        }
                    });

                }

                this.movies = new movieCollection(uniqueMovies);
                this.movies = this.movies.changeSort('byPopularity');

                // Limit theaters to 5
                var filteredTheaters = {
                    models: []
                };
                filteredTheaters.models = this.options.theaters.models.slice(0, 5);
                $(this.el).html(this.template({ movies: this.movies, theaters: filteredTheaters, zipCode: this.options.zipCode, localize: window.ObjectCollections.Localization.result }));

                this.setEllipsis();
            },

            events: {
                'click #movie-showtimes': 'showMovieDetails',
                'click .carousel-item': 'showMovieData',
                'click #movie-trailer': 'movieTrailer'
            },

            showMovieDetails: function (e) {
                var that = this;
                var uniqueCodes = new Array;
                var uniqueTheaters = new Array;
                var theaterList = new Array();
                var featureCode = window.appConfig.GroupMovies ? $('.carousel-item.active').attr('data-featurecode') : $(e.currentTarget).attr('data-featurecode');
                var tmdbId = window.appConfig.GroupMovies ? $('.carousel-item.active').attr('data-tmdbid') : $(e.currentTarget).attr('data-tmdbid');

                for (var i = 0; i < that.options.movies.models.length; i++) {
                    var item = that.options.movies.models[i];
                    if (!window.appConfig.GroupMovies && item.get('code').trim() == featureCode) {
                        theaterList.push(item.theaterId);
                    } else if ((tmdbId && tmdbId != -1 && item.get('tMDBId') && item.get('tMDBId') == tmdbId) || (item.get('code').trim() == featureCode)) {
                        uniqueCodes.push(item.get('code').trim());

                        if (uniqueTheaters.indexOf(item.theaterId) < 0)
                            uniqueTheaters.push(item.theaterId);
                    }
                }

                if (window.appConfig.GroupMovies) {
                    theaterList = uniqueTheaters.join(',');
                    featureCode = uniqueCodes.join(',');
                }

                Backbone.history.navigate("movie/" + featureCode + "/" + theaterList, { trigger: true });
            },

            setEllipsis: function () {
                $("#movie-description").dotdotdot({
                    ellipsis: '(...)',
                    wrap: 'word',
                    lastCharacter: {
                        /*	Remove these characters from the end of the truncated text. */
                        remove: [' ', ',', ';', '.', '!', '?']
                    }
                });
            },
            showMovieData: function (ev) {
                var featureCode = $(ev.currentTarget).attr('data-featureCode');
                var theaterId = $(ev.currentTarget).attr('data-theaterId');

                $(".carousel-item.active").removeClass("active");
                $(ev.currentTarget).addClass("active");

                var movie = window.ObjectCollections.MovieCollection.getMovie(featureCode, theaterId);
                var movieName = movie.get('name');

                if (window.appConfig.GroupMovies) {
                    var movieGroup = window.ObjectCollections.MovieCollection.getMovieGroup(movie.get('code'));

                    var experienceFilters = window.HtmlHelper.getStandards();
                    for (var i = 0; i < experienceFilters.length; i++) {
                        movie.set(experienceFilters[i].key, movieGroup[experienceFilters[i].key]);
                    }

                    if (movie.get('tMDBName')) {
                        movieName = movie.get('tMDBName');
                    }
                }

                // Populate movie data
                $("#movie-name").html(movieName || '');
                $("#movie-rating").html(movie.get("rating") || '');
                $("#movie-description").html(movie.get("description") || '');

                movie.get("dDDFlag") ? $('.ddd-badge').show() : $('.ddd-badge').hide();
                movie.get("imaxFlag") ? $('.imax-badge').show() : $('.imax-badge').hide();

                this.setEllipsis();

                if (movie.get("image")["large"])
                    $("#movie-image").attr("src", movie.get("image")["large"]).fadeIn();
                else
                    $("#movie-image").fadeOut();
                if (movie.get("trailerUrl"))
                    $("#movie-trailer").attr("data-featureCode", featureCode).show();
                else
                    $("#movie-trailer").hide();

                $('#movie-showtimes').attr('data-featurecode', $.trim(movie.get("code")));

                var futureMovie = DtHelper.getBussinessDate(DtHelper.convertDate(movie.get('nextPerformance').showTime), true) != DtHelper.getBussinessDate(new Date(), true);
                $('.sticker-carousel-active').css('display', futureMovie ? '' : 'none');
            },

            movieTrailer: function (e) {
                $("#tubeTrailer").attr("src", $(e.currentTarget).attr("data-trailerurl"));
            }
        });

        return view;
    });