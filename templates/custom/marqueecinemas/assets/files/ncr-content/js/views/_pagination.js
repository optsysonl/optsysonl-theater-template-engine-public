define(['text!templates/_pagination.html'
], function (template) {

    var view = Backbone.View.extend({
        el: 'body',

        template: _.template(template),

        initialize: function (arg) {
            $(this.$el).off("click", ".pagination li");
            this.vent = this.options.vent;
            if (this.options.perPage)
                this.perPage = this.options.perPage;
            this.page = 1;
        },

        events: {
            'click .pagination li': 'clickPage'
        },

        pagination: function () {
            var that = this;
            var page = this.page - 1;
            var collTemp = this.collection;
            collTemp = _.rest(collTemp, (this.perPage * page));
            collTemp = _.first(collTemp, (this.perPage));
            var result = _.map(collTemp, function (model) {
                var newModel = model.toJSON();
                if (that.options.modelConstructor) //You can add yours property to new model
                    that.options.modelConstructor(model, newModel);
                return newModel;
            });
            return result;
        },

        clickPage: function (ev) {
            var a = $(ev.target).data('button-id');

            switch (a) {
                case ('First'):
                    {
                        if (this.page > 1) {
                            this.page = 1;
                            window.lastSelectedPage = this.page;
                            this.apply();
                        }
                        break;
                    };
                case ('Previous'):
                    {
                        if (this.page > 1) {
                            this.page--;
                            window.lastSelectedPage = this.page;
                            this.apply();
                        }
                        break;
                    };
                case ('Next'):
                    {
                        if (this.page < this.totalPages) {
                            this.page++;
                            window.lastSelectedPage = this.page;
                            this.apply();
                        }
                        break;
                    };
                case ('Last'):
                    {
                        if (this.page < this.totalPages) {
                            this.page = this.totalPages;
                            window.lastSelectedPage = this.page;
                            this.apply();
                        }
                        break;
                    };
                default:
                    {
                        var p = parseInt(a) || 0;
                        if (this.page <= this.totalPages) {
                            this.page = p;
                            window.lastSelectedPage = this.page;
                            this.apply();
                        }
                        break;
                    };
            };


            ev.preventDefault();
        },

        apply: function () {
            this.vent.trigger('applyPagination', { collection: this.pagination() });
        },

        render: function (arg) {
            var result = '';
            if (arg.reset && !window.lastSelectedPage) {
                this.page = 1;
            } else if (window.lastSelectedPage) {
                this.page = window.lastSelectedPage;
            }
            this.collection = arg.collection;
            var itemsPerPage = this.perPage;
            var length = this.collection.length;
            this.totalPages = length / itemsPerPage | 0;
            var c = length % itemsPerPage;
            if (c > 0)
                this.totalPages++;
            if (this.totalPages > 0) {
                var start, end = 0;
                if (this.totalPages > 4) {
                    if (this.page + 3 < this.totalPages)
                        start = this.page - 1;
                    else start = this.totalPages - 4;

                    if ((start + 4) > this.totalPages)
                        end = this.totalPages;
                    else
                        end = start + 4;
                } else {
                    start = 0;
                    end = this.totalPages;

                }
                result = this.template({
                    itemsPerPage: itemsPerPage,
                    totalPages: this.totalPages,
                    page: this.page,
                    start: start,
                    end: end,
                    localize: window.ObjectCollections.Localization.result
                });

            };
            if (arg.reset) {
                this.apply();
            }
            return result;
        }
    });

    return view;
});