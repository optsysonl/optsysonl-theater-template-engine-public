define(['text!templates/_theatersContent.html',
        'sharedhelpers/cachingProvider'
], function (template) {
    var view = Backbone.View.extend({
        el: 'body',

        template: _.template(template),

        initialize: function () {
        },

        render: function () {
            var cache = new CachingProvider();
            var showDistance = cache.read('Latitude') != 0 || cache.read('Longitude') != 0;

            var searchUnit = window.AppProperties.SearchUnit;
            searchUnit = searchUnit.charAt(0).toUpperCase() + searchUnit.slice(1);

            this.el = this.options.container;
            $(this.el).html(this.template({
                theaters: this.options.theaters,
                showDistance: showDistance,
                distanceUnit: searchUnit + ' ' + window.ObjectCollections.Localization.result.away,
                localize: window.ObjectCollections.Localization.result
            }));
        }
    });

    return view;
});