define([], function () {
    window.SeatModel = BaseModel.extend({
        initialize: function (attributes) {
            this.set({ status:'' });
        }
    });

    return window.SeatModel;
});
