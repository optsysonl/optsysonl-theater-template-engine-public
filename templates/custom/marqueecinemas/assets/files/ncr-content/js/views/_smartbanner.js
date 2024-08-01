define(['text!templates/_smartbanner.html'
], function (template) {

    var view = Backbone.View.extend({
        el: "#smart-banner-container",
        template: _.template(template),
        initialize: function () {
            this.height = $(this.el).css('height');
        },
        render: function () {
            this.show();
            $(this.el).html(this.template({ localize: this.options.localize }));
        },

        events: {
            'click .view-button': 'download',
            'click .close-button': 'close'
        },

        show: function () {
            var that = this;

            $("#smart-banner-container").show();
            $("#smart-banner-container").width(window.innerWidth);

            //Start banner animation
            $('#smart-banner-container').animate({ top: 0, opacity: 1 }, 'slow', function () {
                $('#smart-banner-container').addClass('smart-banner-animation-complete');
            });

            //Push the entire content bellow the banner when the animation starts
            $('#topNavbar').css('position', 'relative');
            $('body').children('div').not('#smart-banner-container, #backgroudStage, .root-container').css('position', 'relative');
            $('.main-container').css('margin-top', '30px');
            $('.page-container').animate({ top: this.height }, 'slow');

            //Handle banner behavior when navigating away from Home
            $(window).on('hashchange', function () {
                if ($('#smart-banner-container:visible').length > 0) {
                    that.close();
                }
            });

            //Adjust the banner width on window resize
            $(window).on('resize', function () {
                if ($('#smart-banner-container:visible').length > 0) {
                    $('#smart-banner-container').css('width', window.innerWidth);
                }
            });
        },

        download: function () {
            this.close();
            window.open("market://details?id=" + window.appConfig.PlayStoreID);
        },

        close: function () {
            var height = '-' + this.height;
            $('#smart-banner-container:visible').animate({ top: height }, 'slow', function () {
                $('#smart-banner-container').hide();
            });
            $('.page-container').animate({ top: 0 }, 'slow');
            if ($('.modal-backdrop').length == 1) {
                $('.modal-backdrop').animate({ top: 0 }, 'slow');
            }
        },
    });

    return view;
});

