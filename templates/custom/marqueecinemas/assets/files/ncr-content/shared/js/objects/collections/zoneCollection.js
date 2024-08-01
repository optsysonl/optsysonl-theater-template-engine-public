
define(['models/zoneModel'], function (ZoneModel) {
    window.ZoneCollection = BaseCollection.extend({
        model: ZoneModel,
        initialize: function (arg) {
        }
    });

    // Returns the Model class
    return window.ZoneCollection;
});