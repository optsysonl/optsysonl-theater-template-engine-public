define(['text!templates/_topNavigation.html'
], function (template) {
    var view = Backbone.View.extend({
        el: 'body',

        template: _.template(template),

        initialize: function () {
            this.localize = this.options.localize;
        },
        render: function () {
            var buttonNavigate = "";
            if(this.options.navigation.length > 1)
                buttonNavigate = this.options.navigation[this.options.navigation.length - 2 ].href;

            this.el = this.options.container;
            $(this.el).html(this.template({
                navigation: this.options.navigation,
                showBackButton: this.options.showBackButton,
                localize: this.localize,
                buttonNavigate: buttonNavigate
            }));
        }
    });

    return view;
});