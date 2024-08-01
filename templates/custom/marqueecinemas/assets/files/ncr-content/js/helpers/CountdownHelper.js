var CountdownHelper = function () {
    var _timeout = null;
    var _timeString = null;

    function initCountdown() {
        var orderModel = window.ObjectModels.OrderModel;

        if (_timeString && $('#checkout-menu').find("[data-tab-name='review']").hasClass('active')) {
            if (_timeout < 60)
                $('.timeToOrder').addClass('minuteLeft');

            $('.order-time').html(_timeString);
        }

        if (orderModel && orderModel.get('timeout') && !orderModel.get('interval')) {
            orderModel.set('interval', setInterval(function () { countdown(orderModel.get('timeout')); }, 1000));
        }
    }

    function destroy() {
        var orderModel = window.ObjectModels.OrderModel;
        if (orderModel.get('interval'))
            clearInterval(orderModel.get('interval'));
    }

    function stop() {
        clearInterval(window.ObjectModels.OrderModel.get('interval'));
        window.ObjectModels.OrderModel.set('interval', null);
    }

    function start() {
        var orderModel = window.ObjectModels.OrderModel;
        if (orderModel && orderModel.get('timeout') && !orderModel.get('interval')) {
            orderModel.set('interval', setInterval(function () { countdown(orderModel.get('timeout')); }, 1000));
        }
    }
    function countdown(time) {
        var orderModel = window.ObjectModels.OrderModel;
        if (!orderModel) return;

        var now = new Date();
        var orderTimeout = orderModel.get('orderTimeout');

        if (!orderTimeout) {
            orderTimeout = new Date();
            orderTimeout = orderTimeout.setSeconds(orderTimeout.getSeconds() + time);
        }

        var diff = orderTimeout - now.getTime();
        _timeout = diff / 1000;

        var minutes = Math.floor(diff / (1000 * 60));
        var seconds = Math.floor(diff / 1000);
        seconds = seconds - minutes * 60;

        if (minutes < 1)
            $('.timeToOrder').addClass('minuteLeft');

        orderModel.set('orderTimeout', orderTimeout);

        if (minutes < 0) {
            orderModel.set('orderTimeout', null);
            _timeout = null;
            orderModel.cancelSale(function () {
                showAlert(window.ObjectCollections.Localization.result['orderTimedOut'], {
                    postBack: function () {
                        location.reload(true);
                    },
                    dismissPopup: true
                });
            });

            return;
        }

        if (seconds < 10)
            seconds = '0' + seconds;

        _timeString = (minutes < 1 ? '' : minutes) + ':' + seconds;
        $('.order-time').html(_timeString);
    }

    return {
        initCountdown: initCountdown,
        destroy: destroy,
        stop: stop,
        start: start
    };
}();