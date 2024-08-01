define(["backbone"], function (Backbone) {
    window.BaseCollection = Backbone.Collection.extend({
        RESTUri: appConfig.RESTUri
    });

    // Returns the Model class
    return window.BaseCollection;
});