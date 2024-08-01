define(["models/localizeModel", 'collections/baseCollection'], function (localizeModel) {
    window.LocalizeCollection = BaseCollection.extend({
        model: localizeModel,
        initialize: function (arg) {
            if (arg && arg.path)
                this.path = arg.path;
            else
                this.path = 'shared_top_level/js/language/';

        },
        sync: function (method, model, options) {
            var url = this.url;
            $.ajax({
                url: url,
                contentType: 'application/json',
                type: "GET",
                dataType: "json",
                async: false,
                error: function (response) {
                    options.error(response);
                },
                success: function (response) {
                    options.success(response);
                }
            });
        },

        getLocalization: function (fileName, languageCode, callback) {
            try {
                var that = this;
                var defaultLang = "en";
                if (!languageCode || languageCode.length == 0)
                    languageCode = defaultLang;
                var items = _.filter(that.models, function (item) {
                    return item.get('code') == languageCode && item.get('name') == fileName;
                });
                if (items && items[0]) {
                    callback(items[0].get('result'));
                } else {
                    this.url = '/assets/files/ncr-content/js/localization/' + languageCode + '/' + fileName + '.json';
                    this.fetch({
                        add: true,
                        error: function (collection, xhr) {
                            if (xhr.status == 404) {
                                that.url = '/assets/files/ncr-content/js/localization/' + defaultLang + '/' + fileName + '.json';
                                that.fetch({
                                    add: true,
                                    success: function (coll, response) {
                                        callback(response.result);
                                    }
                                });
                            };
                        },
                        success: function (collection, response) {
                            callback(response.result);
                        }
                    });
                }
            } catch (e) {
                console.log('error localization fileName, languageCode, error object', fileName, languageCode, e);
            }
        },

        getLocalizationGlobal: function (fileName, callback) {
            try {
                var that = this;

                var defaultLang = "default";
                if (!fileName || fileName.length == 0)
                    fileName = defaultLang;
                var url = this.path + fileName + '.json';

                this.url = url;
                this.fetch({
                    add: true,
                    error: function (collection, xhr) {
                        console.log('after fetch error', xhr);
                        if (xhr.status == 404) {
                            that.url = url;
                            that.fetch({
                                add: true,
                                success: function (coll, response) {
                                    if (response.result)
                                        that.result = response.result;
                                    else
                                        that.result = response;

                                    callback(response);
                                }
                            });
                        };
                    },
                    success: function (collection, response) {
                        that.result = response;
                        callback(response);
                    }
                });

            } catch (e) {
                console.log('error localization fileName, languageCode, error object', fileName, e);
            }
        }
    });

    // Returns the Model class
    return window.LocalizeCollection;
});