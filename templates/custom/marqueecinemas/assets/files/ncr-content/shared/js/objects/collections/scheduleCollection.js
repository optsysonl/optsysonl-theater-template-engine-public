define(["models/scheduleModel", 'sharedhelpers/errorHelper'], function (scheduleModel) {
    window.ScheduleCollection = BaseCollection.extend({
        model: scheduleModel,
        url: function () {
            return this.RESTUri + 'theaters/' + this.theaterId + '/schedule' + (this.businessDate ? "/" + this.businessDate : "");
        },
        parse: function (resp) {
            this.result_code = resp.result_code;
            return resp.result;
        },
        initialize: function (arg) {
            if (arg) {
                this.theaterId = arg.theaterId;
            }
        },
        strategies: {
            byName: function (schedule) { return schedule.get('name'); }
        },
        getTheaterSchedule: function (businessDate, successCallback, errorCallback) {
            var that = this;
            this.businessDate = businessDate;

            return this.fetch({
                success: function (result) {
                    result.comparator = that.strategies['byName'];
                    result.sort();
                    successCallback(result);
                },
                error: function (model, xhr) {
                    if (errorCallback)
                        errorCallback(model, xhr);
                }
            });
        },
        getMovieAndPerformance: function (movieCode, performanceId) {
            var perf = null;
            var movie = null;

            if (movieCode, performanceId) {
                _.each(this.models, function (feature) {
                    if ($.trim(feature.get('code')) == $.trim(movieCode)) {
                        movie = feature;
                        _.each(feature.get('performances').models, function (performance) {
                            if (performance.get('number') == performanceId) {
                                perf = performance;
                            }
                        });
                    }
                });
            }
            return { performance: perf, movie: movie };
        }
    });

    return window.ScheduleCollection;
});