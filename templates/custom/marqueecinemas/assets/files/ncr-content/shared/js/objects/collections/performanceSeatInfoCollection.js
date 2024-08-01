define(["models/performanceSeatInfoModel"], function (PerformanceSeatInfoModel) {

    window.PerformanceSeatInfoCollection = BaseCollection.extend({
        model: PerformanceSeatInfoModel,
        initialize: function () {
            this.overrides = null;
        },
        parse: function (resp, xhr) {
            this.overrides = resp.overrides;
            return resp.statuses;
        }
    });

    return window.PerformanceSeatInfoCollection;
});