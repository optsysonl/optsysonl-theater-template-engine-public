define(['../../ncr-content/js/router', 'collections/localizeCollection', 'easyXDM'], function (router, localizeCollection) {
    var initialize = function () {
        window.ObjectCollections = { TheaterCollection: {}, MovieCollection: {}, ConcessionCollection: {} };
        window.ObjectViews = {};
        window.Breadcrumbs = [];
        window.AppProperties = { CacheTimeout: appConfig.CacheTimeout, AuthorizationHeader: {}, SelectedDate: null, SelectedTheater: null, SearchUnit: null };
        window.ObjectModels = {};
        window.AppProperties.ShowTheaterDistance = false;
        window.ObjectCollections.Localization = new localizeCollection({ path: '/assets/files/ncr-content/shared/js/language/' });

        if ($.browser.msie && parseInt($.browser.version) < 9) {
            window.location = "/assets/files/ncr-content/templates/BrowserSupport.html";
            return;
        }
        requirejs.onError = function (err) {
            if (err.requireType === 'timeout') {
                alert("Timeout. Please try again. " + err);
            } else {
                throw err;
            }
        };

        window.isMobileDevice = function () {
            return navigator.notification != undefined;
        };

        $(document).ready(function () {
            if (window.orientation != undefined) {
                window.onorientationchange = updateView;
            }
        });

        function updateView() {
            $("#topNavbar").width(window.innerWidth);
            $("#backgroudStage").width(window.innerWidth);

        };

        window.showPageLoadingMessage = function () {
            showOverlay();
            var spinner = $("#spinner");
            if (spinner.css('display') == 'none') {
                spinner.show();
            }
        };

        window.hidePageLoadingMessage = function () {
            var spinner = $("#spinner");

            spinner.hide();

            hideOverlay();
        };

        window.showOverlay = function () {
            $('#overlay').show();
        };
        window.hideOverlay = function () {
            $('.modal-backdrop.fade.in').remove();
            $('#overlay').hide();
        };
        require(['jqueryUI'], function () {
            window.showAlert = function (message, arg) {
                try {
                    arg = arg || {};

                    if (arg.dismissPopup) {
                        $('.ui-dialog').remove();
                    }

                    if ($('#facebook').length > 0) {
                        $('#facebook').hide();
                    }

                    hideOverlay();
                    if ($('.ui-dialog').length > 0) {
                        return;
                    }

                    var buttonText = (arg.buttonText == undefined) ? "Ok" : arg.buttonText;
                    var title = (arg.title == undefined) ? "The page says:" : arg.title;
                    var buttons = [];

                    if (arg && arg.dialogType) {
                        buttons.push({
                            text: buttonText,
                            click: function () {
                                hidePageLoadingMessage();
                                $(this).dialog("close");
                                _.defer(function () {
                                    if (arg.postBack) {
                                        arg.postBack(true);
                                    }
                                });

                                div.remove();
                            }
                        });

                        buttons.push({
                            text: 'Cancel',
                            click: function () {
                                hidePageLoadingMessage();
                                $(this).dialog("close");
                                _.defer(function () {
                                    if (arg.postBack) {
                                        arg.postBack(false);
                                    }
                                });
                                div.remove();
                            }
                        });
                    } else {
                        buttons.push({
                            text: buttonText,
                            click: function () {
                                hidePageLoadingMessage();
                                $(this).dialog("close");
                                _.defer(function () {
                                    if (arg.postBack) {
                                        arg.postBack(true);
                                    }
                                });
                                div.remove();
                            }
                        });
                    }
                    var div = $('<div>');
                    div.html(message);
                    div.attr('title', title);
                    div.dialog({
                        dialogClass: "no-close",
                        autoOpen: true,
                        modal: true,
                        draggable: true,
                        resizable: false,
                        buttons: buttons
                    });

                    $('.ui-dialog').each(function () {
                        try {
                            var z = $(this).css('z-index');
                            $(this).css('z-index', (parseInt(z) || 0) + 5000);
                            $(this).disableSelection();
                        }
                        catch (error) {
                        };
                    });
                }
                catch (er) {
                    alert(message);
                };
            };
        });
        var clearState = function () {
            if (window.ObjectModels.OrderModel && window.ObjectModels.OrderModel.get('saleId') && !(window.ObjectModels.OrderModel.get('finished') === true)) {
                window.ObjectModels.OrderModel.cancelSale(function () {
                    var cache = new CachingProvider();
                    cache.remove('saleId');
                });
            }
        };

        window.hideZipFilter = function () {
            $("#zipDistanceFilterTop").empty();
        };
        window.hideTopNavigation = function () {
            $("#topNavigation").empty();
        };

        window.addEventListener('beforeunload', function () {
            clearState();
        });
        window.checkOrderStatus = function (callback) {
            if (window.ObjectModels.OrderModel && window.ObjectModels.OrderModel.get('saleId') && !(window.ObjectModels.OrderModel.get('finished') === true)) {
                if (window.ObjectModels.OrderModel.get('processing')) {
                    callback(false);
                    return;
                }
                hidePageLoadingMessage();
                showAlert(window.ObjectCollections.Localization.result['cancelPurchase'], {
                    dialogType: true,
                    postBack: function (result) {
                        if (result && window.ObjectModels.OrderModel) {
                            window.ObjectModels.OrderModel.cancelSale(function () {
                                CountdownHelper.destroy();
                                var cache = new CachingProvider();
                                cache.remove('saleId');
                                window.ObjectModels.OrderModel = null;
                                if (callback) {
                                    callback(result);
                                }
                            });
                        } else {
                            if (callback) {
                                callback(result);
                            }
                        }
                    }
                });
            } else {
                if (callback) {
                    callback(true);
                }
            }
        };

        initializeInternal(function (response) {
            window.ObjectCollections.Localization.getLocalizationGlobal(window.appConfig.Language, function () {
                var localize = window.ObjectCollections.Localization.result;
                window.AppProperties.SearchUnit = (window.ChainInfo == null || window.ChainInfo.defaultSearchRadiusIsInMiles()) ? localize.miles : localize.kilometers;

                hidePageLoadingMessage();
                if (response) {
                    router.initialize();
                } else {
                    showAlert(localize.unableToConnect);
                }
            });
        });
    };

    var initializeInternal = function (callback) {
        showPageLoadingMessage();

        require(['shared/encode'], function () {
            var requestHeaders = { 'Authorization': 'Basic ' + window.Encoder.base64Encode(window.appConfig.RESTAuth), "Content-Type": "application/json; charset=utf-8", "WrapResponse": "true", "Accept": "application/json" };

            var that = this;
            that.xhr = new easyXDM.Rpc({
                    remote: appConfig.RemoteUrl
                },
                {
                    remote: {
                        request: {}
                    }
                });
            Backbone.sync = function (method, obj, options) {
                if (!options.preventLoadingMessage) {
                    showPageLoadingMessage();
                }

                var requestMethod;
                switch (method) {
                    case 'create':
                        requestMethod = "POST";
                        break;
                    case 'read':
                        requestMethod = "GET";
                        break;
                    case 'update':
                        requestMethod = "PUT";
                        break;
                    case 'delete':
                        requestMethod = "DELETE";
                        break;
                }
                if (requestMethod) {
                    var url = $.isFunction(obj.url) ? obj.url() : obj.url;

                    if (obj.toJSON !== undefined) {
                        obj = obj.toJSON();
                    }

                    var data = JSON.stringify(obj);

                    that.xhr.request({
                        url: url,
                        method: requestMethod,
                        data: data,
                        timeout: 70000,
                        headers: requestHeaders
                    }, function (response) {
                        if (window.ObjectModels.OrderModel) {
                            window.ObjectModels.OrderModel.unset('processing');
                        }

                        options.success(jQuery.parseJSON(response.data));
                    }, function (err, xhr) {
                        hidePageLoadingMessage();

                        if (window.ObjectModels.OrderModel) {
                            window.ObjectModels.OrderModel.unset('processing');
                        }

                        options.error(err, xhr);
                    });
                }
            };

            var chainInfo = new ChainInfoModel();
            chainInfo.fetch({
                async: false,
                error: function () {
                    callback(false);
                },
                success: function (result) {
                    window.ChainInfo = result;
                    require(['//connect.facebook.net/en_US/all.js'], function () {
                        if (typeof FB != 'undefined' && FB) {
                            FB.init({
                                appId: appConfig.FacebookAPIKey,
                                cookie: true,
                                oauth: true,
                                status: true,
                                xfbml: true,
                                frictionlessRequests: true
                            });
                        }
                    });

                    require(['sharedhelpers/configurationProvider'], function (configurationProvider) {
                        window.ConfigurationProvider = configurationProvider;
                        callback(true);
                    });
                }
            });
        });
    };

    return {
        initialize: initialize
    };
});