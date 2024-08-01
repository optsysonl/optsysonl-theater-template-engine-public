define([
  'models/theaterModel',
  'collections/theaterCollection',
  'collections/scheduleCollection',
  'collections/movieCollection',
  'text!templates/Theater.html',
  'views/_topNavigation',
  'views/_schedules',
  'views/_map',
  'text!templates/_schedulesTheater.html',
  'collections/concessionCollection',
  'sharedhelpers/cachingProvider',
  'libs/bootstrap-lightbox/bootstrap-lightbox.min'
], function (theaterModel, theaterCollection, scheduleCollection, movieCollection, theaterTemplate, topNavigation, schedulesTemplate, map, schedulesTheaterTemplate, concessionCollection) {

    var view = Backbone.View.extend({
        template: _.template(theaterTemplate),

        vent: _.extend({}, Backbone.Events),

        infoModalLoading: false,

        initialize: function () {
            _.bindAll(this, "filterScheduleByDate");
            _.bindAll(this, "loadTheater");
            infoModalLoading = false;
        },

        events: {
            'click #show-schedules': 'showTabContent',
            'click #show-concessions': 'showTabContent',
            'click #view-map': 'viewMap',
            'click .notification-container': 'showPolicyInfo'
        },

        viewMap: function () {
            var theater = this.model;
            var coordinatesOptions = [];
            coordinatesOptions.push(
            {
                lat: theater.get('latitude'),
                lon: theater.get('longitude'),
                theaterInfo:
                {
                    theaterName: theater.get('name'),
                    theaterAddress1: theater.get('addressLine1'),
                    theaterAddress2: theater.get('addressLine2') || '',
                    theaterCity: theater.get("addressCity"),
                    theaterState: theater.get("addressState"),
                    theaterZip: theater.get("addressZip"),
                    theaterPhoneNumber: theater.get("phone")
                }
            });

            var mapView = new map({ container: "#map_canvas", coordinatesOptions: coordinatesOptions, zoom: 10 });
            mapView.render();
        },
        showPolicyInfo: function () {
            var that = this;
            var localize = window.ObjectCollections.Localization.result;
            var theater = that.model;
            if (!theater.get('warningLong') || that.infoModalLoading) return;
            that.infoModalLoading = true;
            require(['views/InfoPopup'], function (infoPopupView) {
                var infoPopup = new infoPopupView({ container: $('#policy'), title: theater.get('warningTitle'), content: theater.get('warningLong'), confirmButton: { text: localize.ok } });
                infoPopup.render();
                that.infoModalLoading = false;
            });
        },
        showTabContent: function (e) {
            if ($(e.currentTarget).attr("id") == "show-schedules") {
                $("#schedules").css("display", "block");
                $("#concessions").css("display", "none");
            }
            else {
                $("#schedules").css("display", "none");
                $("#concessions").css("display", "block");
            }
        },

        render: function () {
            var date = DtHelper.getCurrentBusinessDate();
            if (window.AppProperties.SelectedDate)
                date = window.AppProperties.SelectedDate;
            this.loadTheater(date);

            this.vent._callbacks = null;
            this.vent.bind("dateChanged", this.filterScheduleByDate);
            hideZipFilter();

        },
        renderLikeButton: function (theater) {
            var theaterFacebookUrl = theater.get('facebookURL');

            if (theaterFacebookUrl) {
                $("#fbLike").html('<iframe id="fbLikeFrame" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width: 100%; height: 100% " allowtransparency="true" src="//www.facebook.com/plugins/like.php?href=' + theaterFacebookUrl + '&send=false&layout=standard&width=50&show_faces=false&font&colorscheme=dark&action=like&height=26&appId=' + appConfig.FacebookAPIKey + '"></iframe>');
            }
        },
        loadTheater: function (date) {
            var self = this;
            var theater = new theaterModel({ id: this.options.theaterId });
            var theaterMaster = theater;
            theater.getTheater(function (model) {
                self.model = model;

                // Retrieve concessions
                var concessions = null;

                if (window.ConfigurationProvider.useConssesion(theaterMaster)) {
                    concessions = new concessionCollection(self.options.theaterId);
                    concessions.fetch({
                        error: function () {
                            nextStep();
                        },
                        success: function (result) {
                            concessions = result;
                            nextStep();
                        }
                    });
                } else {
                    nextStep();
                }

                function nextStep() {
                    var message;

                    if (concessions && concessions.error_code != 200)
                        message = concessions.models[0].get('result') ? concessions.models[0].get('result').message : '';
                    else message = false;

                    $(self.el).html(self.template({ theater: theater, concessions: concessions, message: message, localize: window.ObjectCollections.Localization.result }));
                    self.renderLikeButton(theater);

                    self.loadTopNavigation(theater.get("name"));
                    self.options.theaterName = theater.get("name");

                    // Load schedules
                    var businessDate = window.DtHelper.getBussinessDate(new Date(date));
                    var schedules = new scheduleCollection({ theaterId: theater.get("id") });
                    schedules.getTheaterSchedule(businessDate, function (result) {
                        theater.schedules = result;
                        var schedulesTemplateView = new schedulesTemplate({
                            container: "#schedules",
                            showLegend: true,
                            showDateFilter: true,
                            schedules: new movieCollection(result.models),
                            schedulesPerLine: 3,
                            showScheduleImage: true,
                            showScheduleData: true,
                            vent: self.vent,
                            date: date,
                            theaterId: self.options.theaterId,
                            availableDates: theater.get("showDates"),
                            theater: theater,
                            schedulesTemplate: schedulesTheaterTemplate
                        });

                        schedulesTemplateView.render();
                        if ($('#schedules').html() == '')
                            $('#theaterTabs').hide();

                        hidePageLoadingMessage();
                    },
                    function () {
                        hidePageLoadingMessage();
                    });
                }
            },
            function () {
                hidePageLoadingMessage();
            });
        },

        filterScheduleByDate: function () {
            showPageLoadingMessage();
            this.loadTheater(window.AppProperties.SelectedDate);
        },

        loadTopNavigation: function (cinemaName) {
            var navigation = new Array();
            if (window.Breadcrumbs.length > 0) {
                if (window.Breadcrumbs[window.Breadcrumbs.length - 1].displayName == cinemaName) {
                    window.Breadcrumbs.splice(window.Breadcrumbs.length - 1, 1);
                }
                _.each(window.Breadcrumbs, function (breadcrumb) {
                    navigation.push({ isLink: true, name: breadcrumb.displayName, href: breadcrumb.link });
                });
            }
            else {
                navigation.push({ isLink: true, name: "Home", href: "#home" });
                navigation.push({ isLink: true, name: "Theaters", href: "#theaters" });
                window.Breadcrumbs = [{ displayName: 'Home', link: "#home" }, { displayName: 'Theaters', link: "#theaters" }];
            }

            navigation.push({ isLink: false, name: cinemaName });

            window.Breadcrumbs.push({ displayName: cinemaName, link: "#" + Backbone.history.fragment });

            var topNavigationView = new topNavigation({ container: "#topNavigation", navigation: navigation, showBackButton: true, localize: window.ObjectCollections.Localization.result });
            topNavigationView.render();
            $("#topNavigation .separator").hide();

            if (window.singleSite) {
                $('a[href=#theaters].btn-back').attr('href', '#home');
            }
        }
    });

    return view;
});