define(function () {

    window.MovieScheduleModel = BaseModel.extend({

        initialize: function () {
        },
        getAvailableShowDates: function () {
            var availableShowDates = new Array();
            _.each(this.get("schedules"), function (schedule) {
                _.each(schedule.performances, function (performance) {
                    if (jQuery.inArray(performance.businessDate, availableShowDates) < 0) {
                        availableShowDates.push(performance.businessDate);
                    }
                });
            });
            return availableShowDates;
        }
    });

    return window.MovieScheduleModel;
});