define(['text!templates/Tabs.html'
], function (template) {

    var view = Backbone.View.extend({
        vent: _.extend({}, Backbone.Events),

        template: _.template(template),

        initialize: function () {
        },
        render: function () {
            this.$el.html(this.template({ tabOptions: this.options.tabsOptions, localize: this.options.localize }));
        },
        tabClickHandler: function (e, arg) {
            if (window.ObjectModels.OrderModel.get('processing')) {
                return;
            }
            this.options.vent.trigger('tabClickHandler', { e: e, arg: arg });
        },
        events: {
            'click .step-box': 'tabClickHandler'
        }
    });




    return view;
});