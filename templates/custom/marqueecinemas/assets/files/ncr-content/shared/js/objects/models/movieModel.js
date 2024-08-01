define(["collections/performanceCollection", "models/scheduleModel", "collections/scheduleCollection"],
    function (PerformanceCollection, ScheduleModel, ScheduleCollection) {

        window.MovieModel = BaseModel.extend({
            idAttribute: "id",
            theaterId: '',
            theaterName: '',
            popularityCalculated:'',
            distance: 0,
            initialize: function (attributes) {
                if (attributes) {
                    this.id = attributes.id;
                }

                if (!this.performances)
                    this.performances = new PerformanceCollection();
                if (!this.schedule)
                    this.schedule = new ScheduleCollection();

            },
            parse: function (response) {
                this.performances = new PerformanceCollection(response.performances);
                if (response.schedules) {
                    this.schedule = new ScheduleCollection(response.schedules, { 'theaterId': response.schedules[0].theaterId });
                }
                delete response.performances;
                delete response.schedules;
                return response;
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
            },
            attachPerformances: function() {
                if (this.performances.models.length == 0 && this.get('performances') && this.get('performances').length > 0) {
                    this.performances.add(this.get('performances'));
                }
            }
        });

        return window.MovieModel;
    });

