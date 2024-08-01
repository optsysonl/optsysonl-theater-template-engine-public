define(["models/movieScheduleModel"], function (movieScheduleModel) {
    window.MovieScheduleCollection = Backbone.Collection.extend({
        model: movieScheduleModel,
        initialize: function (arg) {
            if (arg) {
                this.featureCode = arg.featureCode;
                if (arg.theaterId)
                    this.theaterId = arg.theaterId;
            }
        },
        url: function () {
            var list = _.pluck(window.ObjectCollections.TheaterCollection.models, 'id');
            if (list == '')
                list = this.theaterId || '';
            return appConfig.RESTUri + "schedules/" + this.featureCode + "?theaterIds=" + list;
        },
        parse: function (resp) {
            this.result_code = resp.result_code;
            return resp.result[0];
        },
        getMovieSchedule: function (successCallback, errorCallback) {
            this.fetch({
                success: function (result) {
                    successCallback(result);
                },
                error: function (err) {
                    errorCallback(err);
                }
            });
        }
    });

    return window.MovieScheduleCollection;
});