define([
  'text!templates/_movieDetailsSchedules.html',
  'sharedhelpers/cachingProvider',
  'sharedhelpers/dateTimeHelper'
], function (template) {
    var view = Backbone.View.extend({
        el: 'body',

        template: _.template(template),

        render: function () {
            this.el = this.options.container;
            var that = this;
            var availableLegends = { showPassesAllowed: true, showdDDFlag: false, showimaxFlag: false, showisReservedSeating: false };
            var cache = new CachingProvider();
            var showDistance = cache.read('Latitude') != 0 || cache.read('Longitude') != 0;

            var startDate = new Date(this.options.filterDate);
            var theaters = that.options.theaters;

            var handlePerformanceFeatures = function (theater, performance) {
                if (startDate.format('yyyymmdd') <= performance.businessDate) {
                    if (!performance.passesAllowed && theater.showPassesAllowed)
                        theater.showPassesAllowed = false;

                    if (performance.dDDFlag && !theater.showdDDFlag)
                        theater.showdDDFlag = true;

                    if (performance.imaxFlag && !theater.showimaxFlag)
                        theater.showimaxFlag = true;

                    if (performance.isReservedSeating && !theater.showisReservedSeating)
                        theater.showisReservedSeating = true;
                }
            };

            _.each(theaters, function (theater) {
                theater.showPassesAllowed = true;
                theater.showdDDFlag = false;
                theater.showimaxFlag = false;
                theater.showisReservedSeating = false;

                if (window.appConfig.GroupMovies) {
                    _.each(theater.group, function (movie) {
                        _.each(movie.performances, function (performance) {
                            handlePerformanceFeatures(theater, performance);
                        });
                    });
                } else {
                    _.each(theater.performances, function (performance) {
                        handlePerformanceFeatures(theater, performance);
                    });
                }

                if (availableLegends.showPassesAllowed && !theater.showPassesAllowed)
                    availableLegends.showPassesAllowed = false;

                if (!availableLegends.showdDDFlag && theater.showdDDFlag)
                    availableLegends.showdDDFlag = true;

                if (!availableLegends.showimaxFlag && theater.showimaxFlag)
                    availableLegends.showimaxFlag = true;

                if (!availableLegends.showisReservedSeating && theater.showisReservedSeating)
                    availableLegends.showisReservedSeating = true;

            });

            var searchUnit = window.AppProperties.SearchUnit;
            searchUnit = searchUnit.charAt(0).toUpperCase() + searchUnit.slice(1);

            $(this.el).html(this.template({
                theaters: this.options.theaters,
                movieCode: this.options.movieCode,
                filterDate: this.options.filterDate,
                availableLegends: availableLegends,
                showDistance: showDistance,
                distanceUnit: searchUnit + ' ' + window.ObjectCollections.Localization.result.away,
                localize: window.ObjectCollections.Localization.result,
                movie: this.options.movie
            }));
        },

        getShowTimeLegendOptions: function () {
            var that = this,
                showTimeLegendOptions = { passesAllowed: true, dDDFlag: false, imaxFlag: false, reservedSeating: false };

            _.each(that.options.schedules, function (schedule) {
                schedule.manageShowTimeOptions(showTimeLegendOptions);

                if (schedule.get('dDDFlag') && !showTimeLegendOptions.dDDFlag) {
                    showTimeLegendOptions.dDDFlag = true;
                }

                if (schedule.get('imaxFlag') && !showTimeLegendOptions.imaxFlag) {
                    showTimeLegendOptions.imaxFlag = true;
                }

                schedule.set("scheduleOptionsString", that.buildScheduleOptionsString(schedule));
            });

            return showTimeLegendOptions;
        }
    });

    return view;
});