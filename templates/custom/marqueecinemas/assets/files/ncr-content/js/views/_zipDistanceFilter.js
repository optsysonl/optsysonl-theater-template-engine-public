define(['text!templates/_zipDistanceFilter.html',
        'libs/watermark/jquery.tinywatermark-3.1.0.min'
], function (template) {
    var view = Backbone.View.extend({
        el: 'body',
        parent: undefined,
        template: _.template(template),

        initialize: function () {
            $(this.el).undelegate('#change-zip', 'click');
            $(this.el).undelegate('ul#distanceList li', 'click');
            $(this.el).undelegate('', 'keyup');

            this.vent = this.options.vent;
            this.searchUnit = window.AppProperties.SearchUnit;
            this.localize = this.options.localize;
            this.defaultDistance = this.options.distance;
            _.bindAll(this, 'on_keypress');
        },

        on_keypress: function (e) {
            $('.btn .main-button .add-on').blur();
            var key = e.keyCode || e.which;
            if (key == 13)
                this.applyFilter();
        },

        render: function () {
            var that = this;

            that.el = that.options.container;
            $(that.el).html(that.template({
                zipCode: that.options.zipCode,
                distance: that.options.distance,
                localize: that.localize,
                searchUnit: that.searchUnit,
                showDistance: window.AppProperties.ShowTheaterDistance
            }));
            that.distance({ currentTarget: "#distanceList li[data=" + that.options.distance + "]" });
            require(['jqueryPlaceholder'], function () {
                $(function () {
                    $('input, textarea').placeholder();
                });
            });

            $('#zip-code').off('keypress').on('keypress', function (e) {
                that.on_keypress(e);
            });
        },

        events: {
            'click #change-zip': 'applyFilter',
            'click ul#distanceList li': 'distance'
        },

        distance: function (ev) {
            var distance = $(ev.currentTarget).attr('data');
            var label = $(ev.currentTarget).attr('label');
            $(ev.currentTarget).parent().children('li').removeClass('active');
            $(ev.currentTarget).addClass('active');
            $(this.el).find('#distance').html(label);
            $(this.el).find('#distance').attr('data', distance);

            if (ev.type) {
                require(['sharedhelpers/cachingProvider'],
                    function () {
                        var cache = new CachingProvider();
                        cache.store("Distance", $(ev.currentTarget).attr("data"), window.AppProperties.CacheTimeout);
                    }
                );
            }

            this.applyFilter();
        },
        applyFilter: function () {
            var that = this;

            require(['sharedhelpers/cachingProvider', 'async!//maps.googleapis.com/maps/api/js?sensor=false', 'sharedhelpers/googleapis'],
                function () {
                    var cache = new CachingProvider();
                    if ($("#zip-code").val() != "") {
                        getCoordinates($("#zip-code").val(), function (coordinates) {
                            if (coordinates) {
                                cache.store("Latitude", coordinates.lat, window.AppProperties.CacheTimeout);
                                cache.store("Longitude", coordinates.lon, window.AppProperties.CacheTimeout);
                                cache.store("ZipCode", $("#zip-code").val(), window.AppProperties.CacheTimeout);
                                if (!window.AppProperties.ShowTheaterDistance) {
                                    window.AppProperties.ShowTheaterDistance = true;
                                    that.options.zipCode = $("#zip-code").val();
                                    that.options.distance = $("#distanceList li.active").attr("data") || that.defaultDistance;
                                    that.render();
                                }
                            }
                            var code = cache.read("ZipCode");
                            that.vent.trigger('applyZipDistanceFilter', { zipCode: code, distance: $("#distanceList li.active").attr("data") || that.defaultDistance });
                        });
                    } else {
                        that.vent.trigger('applyZipDistanceFilter', { zipCode: $("#zip-code").val(), distance: $("#distanceList li.active").attr("data") || that.defaultDistance });
                    }
                }
            );
        }
    });

    return view;
});