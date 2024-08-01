define(["models/movieModel", 'sharedhelpers/errorHelper', 'sharedhelpers/htmlHelper'], function (movieModel) {
    window.MovieCollection = BaseCollection.extend({
        model: movieModel,
        theaterId: "",
        businessDate: new Date(),

        initialize: function (attributes) {
            if (attributes && attributes.theaterId) {
                this.theaterId = attributes.theaterId;
            }
        },

        strategies: {
            byName: function (left, right) {
                left = left[0] || left;
                right = right[0] || right;

                var leftVar = !window.appConfig.GroupMovies ? left.get('name') : (left.get('tMDBName') || '') + left.get('name');
                var rightVar = !window.appConfig.GroupMovies ? right.get('name') : (right.get('tMDBName') || '') + right.get('name');

                if (leftVar < rightVar)
                    return -1;
                if (leftVar > rightVar)
                    return 1;
                return 0;
            },

            byDistance: function (left, right) {
                var leftDist = 25000;
                var rightDist = 25000;

                left = left[0] || left;
                right = right[0] || right;

                if (left.distance && left.get('nextPerformance'))
                    leftDist = left.distance;

                while (leftDist.toString().split('.')[0].length < 5) {
                    leftDist = '0' + leftDist;
                }

                if (right.distance && right.get('nextPerformance'))
                    rightDist = right.distance;

                while (rightDist.toString().split('.')[0].length < 5) {
                    rightDist = '0' + rightDist;
                }

                leftDist = leftDist + (left.get('tMDBName') || '') + left.get('name');
                rightDist = rightDist + (right.get('tMDBName') || '') + right.get('name');

                if (leftDist < rightDist)
                    return -1;
                if (leftDist > rightDist)
                    return 1;
                return 0;
            },

            byPerformance: function (left, right) {
                left = left[0] || left;
                right = right[0] || right;

                var leftVar = (left.get('nextPerformance') ? left.get('nextPerformance').showTime : '') + (left.get('tMDBName') || '') + left.get('name');
                var rightVar = (right.get('nextPerformance') ? right.get('nextPerformance').showTime : '') + (right.get('tMDBName') || '') + right.get('name');

                if (leftVar < rightVar)
                    return -1;
                if (leftVar > rightVar)
                    return 1;
                return 0;
            },

            byPopularity: function (left, right) {
                var leftPopularity = left.popularity || left.get('totalPerformanceCount');
                var rightPopularity = right.popularity || right.get('totalPerformanceCount');

                left = left[0] || left;
                right = right[0] || right;

                if (leftPopularity > rightPopularity) {
                    return -1;
                } else if (leftPopularity == rightPopularity) {
                    if ((left.get('tMDBName') || '') + left.get('name') < (right.get('tMDBName') || '') + right.get('name')) {
                        return -1;
                    }
                }
                return 1;
            }
        },

        changeSort: function (sortProperty) {
            this.comparator = this.strategies[sortProperty];

            if (this.models == undefined)
                return null;

            this.sort();

            return this;
        },
        getMovie: function (featureCode) {
            return _.filter(this.models, function (model) {
                return $.trim(model.get('code')) == $.trim(featureCode);
            })[0];
        },
        getMovieGroup: function (featureCode, movie, groupedMovies) {
            movie = movie || this.getMovie(featureCode);
            groupedMovies = groupedMovies || window.ObjectCollections.MovieCollection.groupedMovies;

            if (!movie) {
                return [];
            }

            var tmdbId = movie.get('tMDBId');
            var id = tmdbId && tmdbId != -1 ? tmdbId : movie.get('code').trim();

            return _.find(groupedMovies, function (g) {
                return _.any(g, function (m) { return m.get('tMDBId') && m.get('tMDBId') == id || m.get('code').trim() && m.get('code').trim() == id; });
            });
        },
        refresh: function (sortProperty, lat, lng, callback) {
            require(['collections/theaterCollection'], function (theaterCollection) {
                var theaters = new theaterCollection();
                theaters.latitude = lat;
                theaters.longitude = lng;
                theaters.fetch({
                    success: function (result) {
                        window.ObjectCollections.TheaterCollection = result;
                        window.ObjectCollections.MovieCollection = result.getMovies(sortProperty);

                        callback(window.ObjectCollections.MovieCollection);
                    },
                    error: function () {
                        new ErrorHelper().showAlertByErrorCode();
                    }
                });
            });
        },

        movieNameFilter: '',
        filter: function () {
            var that = this;
            if (that.movieNameFilter && that.movieNameFilter != '') {
                var result = _.filter(that.models, function (m) {
                    var name = m.get('name');
                    var n = name.substr(0, that.movieNameFilter.length);
                    return (n.toLowerCase() == that.movieNameFilter.toLowerCase());
                });
            } else
                result = this.models;
            return result;
        },
        parse: function (resp) {
            this.result_code = resp.result_code;
            return resp.result;
        },

        getMovieSchedule: function (featureCode, theaterIds, callback) {
            this.url = this.RESTUri + 'schedules/' + featureCode + '?theaterIds=' + theaterIds;
            this.fetch({
                success: function (result) {
                    callback(result);
                },
                error: function () {
                    callback();
                    new ErrorHelper().showAlertByErrorCode();
                }
            });
        },

        getMovies: function (theaterId, businessDate, callback) {
            this.theaterId = theaterId;
            this.businessDate = businessDate;

            this.fetch({
                success: function (result) {
                    callback(result);
                },
                error: function () {
                    callback();
                    new ErrorHelper().showAlertByErrorCode();
                }
            });
        },

        url: function () {
            return this.RESTUri + 'theaters/' + this.theaterId + '/schedule/' + this.businessDate;
        },

        groupMultiTypeMovies: function (movies) {
            var that = this,
                groupedMovies = {};

            movies = movies ? movies.models : that.models;

            var experienceFilters = window.HtmlHelper.getStandards();

            var groupMovies = function (id, movie) {
                if (groupedMovies[id]) {
                    groupedMovies[id].push(movie);
                    groupedMovies[id].popularity += movie.get("totalPerformanceCount");
                } else {
                    groupedMovies[id] = [movie];
                    groupedMovies[id].popularity = movie.get("totalPerformanceCount");
                }

                for (var j = 0; j < experienceFilters.length; j++) {
                    if (movie.get(experienceFilters[j].key)) {
                        groupedMovies[id][experienceFilters[j].key] = movie.get(experienceFilters[j].key);
                    } else if (!groupedMovies[id][experienceFilters[j].key]) {
                        groupedMovies[id][experienceFilters[j].key] = false;
                    }
                }

                var nextPerformance = movie.get('nextPerformance');
                if (nextPerformance && nextPerformance.isReservedSeating) {
                    groupedMovies[id].isReservedSeating = true;
                } else if (!groupedMovies[id].isReservedSeating) {
                    groupedMovies[id].isReservedSeating = false;
                }
            };

            _.each(movies, function (movie) {
                var groupId;
                var tmdbId = movie.get('tMDBId');

                var group = _.find(groupedMovies, function (g, key) {
                    groupId = key;
                    return _.any(g, function (m) { return m.get('code').trim() == movie.get('code').trim(); });
                });

                groupId = group ? groupId : (tmdbId && tmdbId != -1 ? tmdbId : movie.get('code').trim());

                groupMovies(groupId, movie);
            });

            //Sorting movies within the group by name value
            if (window.AppConfig.DefaultMovieSort == 'byName') {
                _.each(groupedMovies, function (group) {
                    group.sort(function (a, b) {
                        var leftVar = a.get('name');
                        var rightVar = b.get('name');

                        if (leftVar < rightVar)
                            return -1;
                        if (leftVar > rightVar)
                            return 1;
                        return 0;
                    });
                });
            }

            return _.values(groupedMovies);
        },

        groupMoviesByAttribute: function (customFlags) {
            var that = this;
            var grouped = {};
            _.each(customFlags, function (customFlag) {
                var movies = _.filter(that.models, function (m) {
                    return m.get('customFlags') && _.find(m.get('customFlags'), function (cf) {
                        return cf == customFlag.id;
                    });
                });
                if (movies.length > 0) {
                    grouped[customFlag.id] = movies;
                }
            });
            var groupedMovieList = _.uniq(_.flatten(_.values(grouped)));

            var notGroupedMovies = _.reject(that.models, function (m) {
                return _.find(groupedMovieList, function (gm) {
                    return m.get('code').trim() == gm.get('code').trim();
                });
            });
            if (notGroupedMovies.length > 0) {
                grouped['noGroup'] = notGroupedMovies;
            }
            return grouped;
        },
        groupMultiTypeMoviesByAttribute: function (customFlags, movieGroups) {
            var grouped = {};

            _.each(customFlags, function (customFlag) {
                var flagGroup = [];
                _.each(movieGroups, function (mg) {
                    var hasCustomFlag = _.some(mg, function (m) {
                        return m.get('customFlags') && _.find(m.get('customFlags'), function (cf) {
                            return cf == customFlag.id;
                        });
                    });
                    if (hasCustomFlag) {
                        flagGroup.push(mg);
                        //If we don't want to iterate trough every movie group and compare with every attribute movie group 
                        //we have to keep trak on which movie groups were added
                        mg.added = true
                    }
                });
                if (flagGroup.length > 0) {
                    grouped[customFlag.id] = flagGroup;
                }
            });
            
            var notGrouped = _.filter(movieGroups, function (mg) {
                var added = mg.added;
                delete mg.added;
                return !added;
            });
            if (notGrouped.length > 0) {
                grouped['noGroup'] = notGrouped;
            }
            return grouped;
        }
    });

    // Returns the Model class
    return window.MovieCollection;
});