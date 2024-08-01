define(['text!templates/MoviesSub.html',
        'sharedhelpers/cachingProvider'],
    function (template) {

        var view = Backbone.View.extend({
            template: _.template(template),

            initialize: function () {

            },
            render: function (arg) {
                this.el = this.options.container;
                var cache = new CachingProvider();
                var showDistance = cache.read('Latitude') != 0 || cache.read('Longitude') != 0;

                var searchUnit = window.AppProperties.SearchUnit;
                searchUnit = searchUnit.charAt(0).toUpperCase() + searchUnit.slice(1);

                $(this.el).html(this.template({
                    collection: arg.collection,
                    theaters: arg.theaters,
                    showDistance: showDistance,
                    distanceUnit: searchUnit + ' ' + window.ObjectCollections.Localization.result.away,
                    localize: this.options.localize
                }));
            }
        });

        return view;
    });