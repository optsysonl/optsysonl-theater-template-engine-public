define(["collections/performanceCollection"], function (PerformanceCollection) {

    window.ScheduleModel = BaseModel.extend({
        idAttribute: "theaterId",
        url: function () {
            return this.RESTUri + 'schedules/' + this.get('featureCode') + '?theaterIds=' + this.get('theaterId');
        },
        initialize: function () {
        },
        parse: function (resp) {
            var performances = new PerformanceCollection(resp.performances);
            resp.performances = performances;
            return resp;
        },
        manageShowTimeOptions: function (showTimeOptions) {
            var scheduleOptions = { passesAllowed: true, reservedSeating: true };

            this.get('performances').getShowTimeOptions({ scheduleOptions: scheduleOptions, showTimeOptions: showTimeOptions });

            this.set("passesAllowed", scheduleOptions.passesAllowed);
            this.set("reservedSeating", scheduleOptions.reservedSeating);
        },
        hasReservedSeating: function (businessDate) {
            var that = this;
            var reservedSeating = false;
            _.each(that.get('performances').models, function (performance) {
                
                if (!businessDate || performance.get('businessDate') == businessDate) {
                    if (performance.get('isReservedSeating') && !reservedSeating) {
                        reservedSeating = true;
                    }
                }
            });
            return reservedSeating;
        }
    });

    return window.ScheduleModel;
});