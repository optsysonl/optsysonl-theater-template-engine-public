define(['text!templates/_facebookFriendsContent.html'
], function (template) {

    var view = Backbone.View.extend({
        template: _.template(template),

        initialize: function (arg) {
        },

        render: function (append, arg) {
            if (append)
                $(this.el).append(this.template(arg));
            else
                $(this.el).html(this.template(arg));
        }
    });

    return view;
});