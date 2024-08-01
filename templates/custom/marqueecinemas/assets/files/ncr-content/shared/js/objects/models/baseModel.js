define(["backbone", "jquery"], function (Backbone) {
    window.BaseModel = Backbone.Model.extend({
        id: undefined,
        RESTUri: appConfig.RESTUri
    });

    return window.BaseModel;
});