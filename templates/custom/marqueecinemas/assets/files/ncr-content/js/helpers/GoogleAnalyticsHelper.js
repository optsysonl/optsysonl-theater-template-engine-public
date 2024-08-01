window.GoogleAnalyticsHelper = (function () {
    function _intialize(callback) {
        if (window.appConfig.GoogleAnalyticsId && window.appConfig.GoogleAnalyticsSiteURL) {
            var confirmCallback = function () {
                (function (i, s, o, g, r, a, m) {
                    i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () {
                        (i[r].q = i[r].q || []).push(arguments)
                    }, i[r].l = 1 * new Date(); a = s.createElement(o),
                    m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
                })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
                ga('create', window.appConfig.GoogleAnalyticsId, window.appConfig.GoogleAnalyticsSiteURL);
                ga('require', 'ec'); // Use ecommerce in GA
                callback();
            };
            confirmCallback();
            return;
        }
        callback();
    }

    function _trackPage(route) {
        if (window.ga) {
            // /window.ga('send', 'pageview', route);
            window.ga('send', 'pageview', { 'page': location.pathname + location.search + location.hash});
            console.log('tracked:'+'pageview')
        }
    }
    function _addProductGA(movieID, movieName, movieVariant, movieHouse, movieTime, moviePrice, movieQnt) {
        if (window.ga) {
            window.ga('ec:addProduct', {
                'id': movieID,  //movieID
                'name': movieName,  //movieName
                'category': movieVariant,   //ticketType
                'brand': movieHouse, // theatherName
                'variant': movieTime, //DateTime
                'price': moviePrice,
                'quantity': movieQnt
            }); // Send this specific ticket to analytics
            console.log('tracked: movie' + movieID);
        }
    }

    function _trackEC (orderID, orderTotal, orderTax) {
        if (window.ga) {
            window.ga('ec:setAction', 'purchase', {
                'id': orderID,
                'revenue': orderTotal,
                'tax': orderTax,
            }); // Send transaction to analytics
            console.log('tracked: order'+orderID);
        }
    }
    return {
        intialize: _intialize,
        addProductGA: _addProductGA,
        trackEC: _trackEC,
        trackPage: _trackPage
    };
})();






