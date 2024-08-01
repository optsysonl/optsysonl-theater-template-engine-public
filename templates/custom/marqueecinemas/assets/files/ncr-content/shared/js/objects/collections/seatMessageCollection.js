
define(["models/seatMessageModel"], function (SeatMessageModel) {
    window.SeatMessageCollection = BaseCollection.extend({
        model: SeatMessageModel,
        initialize: function (arg) {
        }
    });

    // Returns the Model class
    return window.SeatMessageCollection;
});