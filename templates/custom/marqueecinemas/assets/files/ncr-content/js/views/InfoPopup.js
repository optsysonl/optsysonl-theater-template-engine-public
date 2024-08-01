define(['text!templates/InfoPopup.html'
], function (template) {
    var view = Backbone.View.extend({
        el: 'body',
        template: _.template(template),
        events: {
            'click #btn-confirm': 'confirmCallback',
            'click #btn-cancel': 'cancelCallback'
        },
        initialize: function () {
            _.bindAll(this, 'confirmCallback', 'cancelCallback');
        },
        render: function () {
            this.el = this.options.container;
            $(this.el).html(this.template({
                title: this.options.title,
                content: this.options.content
            }));
        },
        destroyEvents: function () {
            if ($('#info-modal').hasClass('hidden')) {
                this.undelegateEvents();
            }
        },
        confirmCallback: function () {
            this.options.confirmButton.callback ? this.options.confirmButton.callback() : $('#info-modal').modal('hide');
            this.destroyEvents();
        },
        cancelCallback: function () {
            this.options.cancelButton.callback ? this.options.cancelButton.callback() : $('#info-modal').modal('hide');
            this.destroyEvents();
        }
    });

    return view;
});