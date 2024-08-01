define(['text!templates/securityCodeExplanation.html'
], function (template) {

    var view = Backbone.View.extend({
        template: _.template(template),

        initialize: function () {

        },
        render: function () {
            $(this.el).html(this.template());
        }
    });

    return view;
});
