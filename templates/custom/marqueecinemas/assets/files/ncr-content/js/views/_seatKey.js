define(['text!templates/_seatKey.html'
], function (template) {

    var view = Backbone.View.extend({
        el: 'body',

        template: _.template(template),

        initialize: function () {
        },

        render: function () {
            var self = this;

            self.el = this.options.container;
            $(self.el).html(self.template({
                theater: self.options.theater,
                localize: self.options.localize,
                zones: self.options.zones.models,
                showLoveSeat: self.options.showLoveSeat,
                showCompanion: self.options.showCompanion,
                showWheelChair: self.options.showWheelChair
            }));
        }
    });

    return view;
});