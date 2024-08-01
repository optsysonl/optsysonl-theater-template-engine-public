define(['models/bannerModel',
        'sharedhelpers/utilities'
], function (BannerModel) {
    window.BannerCollection = BaseCollection.extend({
        model: BannerModel,
        initialize: function () {
        },

        url: function () {
            return this.RESTUri + 'banners';
        },

        parse: function (response) {
            if (!response || !response.result_code) {
                return [];
            }

            switch (response.result_code) {
                case 200:
                    return response.result;
                default:
                    return []; //Return empty array if the result code is different from 200
            }
        },

        getRandomBanner: function (bannerType) {
            var utilities = new Utilities();
            var bannerModels = _.filter(this.models, function (m) {
                return bannerType == 'splashScreen' ? m.get('isSplashScreen') : !m.get('isSplashScreen');
            });

            if (bannerModels.length > 0) {
                return bannerModels[utilities.random(0, bannerModels.length)];
            }

            return null;
        }

    });

    // Returns the Model class
    return window.BannerCollection;
});