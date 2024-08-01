define(function () {
    window.FacebookFriendModel = Backbone.Model.extend({
        initialize: function () {
            this.bind("change:status", this.attributesChanged);
        },
        attributesChanged: function () {
        }
    });

    return window.FacebookFriendModel;
});
