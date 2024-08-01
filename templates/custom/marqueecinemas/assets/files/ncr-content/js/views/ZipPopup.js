define(['text!templates/ZipPopup.html'
], function (template) {

    var view = Backbone.View.extend({
        el: 'body',

        template: _.template(template),

        eventFired: false,

        events: {
            'click #confirm-zip': 'confirmZipCode',
            'keypress #zip-code-popup': 'confirmZipCode'
        },
        initialize: function () {
            _.bindAll(this, 'confirmZipCode');
        },

        render: function () {
            var that = this;
            this.$el.html(this.template({
                validationMessage: this.options.validationMessage,
                localize: window.ObjectCollections.Localization.result
            }));
            $('#zip-modal').on('hidden', function () {
                if (!that.eventFired) {
                    that.options.callback('');
                }
            });
            require(['jqueryPlaceholder'], function () {
                $(function () {
                    $('input, textarea').placeholder();
                });
            });
        },

        confirmZipCode: function (e) {
            if (e.keyCode == 13 || e.type == 'click') {
                this.eventFired = true;
                var postalCode = $("#zip-code-popup").val();
                this.options.callback(postalCode);
                $('#zip-modal').modal('hide');
            }
        }
    });

    return view;
});