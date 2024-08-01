/**
 * Script for house choosing popup.
 */

(function ($) {
    "use strict";

    $(document).ready(function () {
        setHousePopup();
    });

    function setHousePopup() {
        var options = {
            _search_input: null,
            _search_button: null,
            _call_popup_btn: null,
            _close: null,
            scrollWidth: 0,
            storageName: 'active-house',
            activeHouse: undefined,
            searchItemsData: {},
            popup: {
                _items_set_button: null,
                container: null,
                items: null
            },
            favorites: {
                cookie_name: 'favorite-houses',
                items: []
            }
        };

        main();

        function main() {
            options.activeHouse = getCookie(options.storageName);
            options.popup.container = $('.set-house-wrapper');
            options._house_list = options.popup.container.find('.set-house-list');
            options._house_list_inner = options._house_list.find('.set-house-inner');

            if (show_popup) {
                showPopup();
            } else {
                options.popup.container.addClass('isset-cookies');
            }

            options.favorites.items = getFavoriteItems();


            options.popup.items = options.popup.container.find('.set-house-item');
            options.popup._items_set_button = options.popup.items.find('.choose-item');
            options._search_input = $('.set-house-search .search-input');
            options._search_button = $('.set-house-search .search-button');
            options._call_popup_btn = $('.active-theater-btn');
            options._close = options.popup.container.find('.close');


            prepare();
            updateFavoriteItems();
            handlers();
        }

        function handlers() {
            $(document).on('click', '.set-house-item .choose-item', function () {
                let d = new Date();
                let month = d.getMonth()+1;
                setCookie(options.storageName, $(this).data('house-id'), {expires: new Date(d.getFullYear(), month, d.getDate(), 0, 0, 0, 0)}, function () {
                    reloadPage();
                });
            });
            options._search_button.on('click', function () {
                if (options._search_input.val().length > 0) {
                    showSearchResults();
                } else {
                    clearSearchResults();
                }
            });
            document.addEventListener('keydown', function (event) {
                if (event.keyCode == 13 && $('.set-house-wrapper .search-input').is(':focus')) {
                    if (options._search_input.val().length > 0) {
                        showSearchResults();
                    } else {
                        clearSearchResults();
                    }
                }
            });
            options._call_popup_btn.on('click', function () {
                showPopup();
            });
            options._close.on('click', function () {
                hidePopup();
            });
            $('body').on('click', '.set-house-item .like', function () {
                let item = $(this).parents('.set-house-item');
                let id = $(this).parents('.set-house-item').attr('id');
                if ($(this).parents('.set-house-item').is('.favorite-item')) {
                    removeFavorite(id);
                } else {
                    addFavorite(id);
                }
                updateFavoriteItems();
            });
        }

        /**
         * @name removeFavorite
         * @description Remove favorite from list
         * @param {integer} id
         */
        function removeFavorite(id) {
            let index = options.favorites.items.indexOf(id);
            if (index > -1) {
                options.favorites.items.splice(index, 1);
            }
        }

        /**
         * @name addFavorite
         * @description Add favorite item into list
         * @param {integer} id
         */
        function addFavorite(id) {
            options.favorites.items.push(id);
        }

        /**
         * @name getFavoriteItems
         * @description Get favorite item id's from cookie
         * @returns {string[] | Array}
         */
        function getFavoriteItems() {
            let data = getCookie(options.favorites.cookie_name);
            if (data === undefined) {
                data = [];
            } else {
                data = data.split(',');
            }
            return data;
        }

        /**
         * @name updateFavoriteItems
         * @description Set favorite to item in location popup
         */
        function updateFavoriteItems() {
            options.popup.items.show();
            $('.set-house-item.favorite-item').remove();
            if (options.favorites.items.length !== 0) {
                for (var i = 0; i < options.favorites.items.length; i++) {
                    let base_item = $('#' + options.favorites.items[i]);
                    let item = base_item.clone();
                    base_item.hide();
                    options._house_list_inner.prepend(item);
                    item.addClass('favorite-item');
                }
            }
            setFavoriteItems();
            $(window).trigger('updateSVGItem');
        }

        /**
         * @name setFavoriteItems
         * @description Set favorite data into cookie.
         */
        function setFavoriteItems() {
            let str = '';
            for (var i = 1; i <= options.favorites.items.length; i++) {
                str += '' + options.favorites.items[i - 1];
                if (i !== options.favorites.items.length) {
                    str += ',';
                }
            }
            let d = new Date();
            let year = d.getFullYear() + 1;
            setCookie(options.favorites.cookie_name, str, {expires: new Date(year, d.getMonth(), d.getDate(), 0, 0, 0, 0)});
        }

        /**
         * @name removeFavoriteItems
         * @description Remove favorites data from cookie.
         */
        function removeFavoriteItems() {
            deleteCookie(options.favorites.cookie_name);
        }

        /**
         * @name reloadPage
         * @description Reload page.
         */
        function reloadPage() {
            location.reload();
        }

        /**
         * @name showSearchResults
         * @description Search algorithm, find house by [name], [city] or [zip]
         */
        function showSearchResults() {
            let search_string = options._search_input.val().toLowerCase();
            $.each(options.searchItemsData, function (key, value) {
                let show_item = false;
                $.each(value, function (_key, _value) {
                    let item = _value.toLowerCase();
                    if (item.search(search_string) == 0) {
                        show_item = true;
                    }
                });
                if (!show_item) {
                    $('#' + key).addClass('hidden-item');
                } else {
                    $('#' + key).removeClass('hidden-item');
                }
            });
        }

        /**
         * @name clearSearchResults
         * @description Clear search results
         */
        function clearSearchResults() {
            options.popup.items.removeClass('hidden-item');
        }

        /**
         * @name prepare
         * @description Prepare
         */
        function prepare() {
            $('body, html').css('overflow', 'hidden');
            let screenWidth1 = $(window).width();
            $('body, html').attr('style', '');
            let screenWidth2 = $(window).width();
            options.scrollWidth = screenWidth1 - screenWidth2;

            options.popup.items.each(function () {
                options.searchItemsData[$(this).attr('id')] = $(this).data('search');
                $(this).data('index', $(this).index()).attr('data-index', $(this).index());
            });
        }

        /**
         * @name showPopup
         * @description Show popup.
         */
        function showPopup() {
            $('body').css({
                'padding-right': options.scrollWidth
            });
            $('body').addClass('show-set-house-popup');
            $('.set-house-wrapper').attr("aria-hidden","false")
        }

        /**
         * @name hidePopup
         * @description Hide popup.
         */
        function hidePopup() {
            $('body').css({
                'padding-right': 0
            });
            $('body').removeClass('show-set-house-popup');
            $('.set-house-wrapper').attr("aria-hidden","true")
        }

        /**
         * @name getCookie
         * @description Get active house data
         * @param {string} name
         * @returns {array}
         */
        function getCookie(name) {
            var matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
            ));
            return matches ? decodeURIComponent(matches[1]) : undefined;
        }

        /**
         * @name setCookie
         * @description Set active house data.
         *              If value isset some data set local storage data,
         *              else if param is undefined - remove storage item.
         * @param {string} name - cookie name.
         * @param {string|undefined} value - cookie value.
         * @param {object|undefined} c_options - cookie options [path], [expires], [domain].
         * @param {function|undefined} callback - what to do after set cookie.
         */
        function setCookie(name, value, c_options, callback) {
            c_options = $.extend({}, c_options, {
                path: '/'
            });

            let expires = c_options.expires;
            if (typeof expires === "number" && expires) {
                var d = new Date();
                d.setTime(d.getMonth() + expires * 1000);
                expires = c_options.expires = d;
            }
            if (expires && expires.toUTCString) {
                c_options.expires = expires.toUTCString();
            }

            value = encodeURIComponent(value);

            var updatedCookie = name + "=" + value;

            for (var propName in c_options) {
                updatedCookie += "; " + propName;
                var propValue = c_options[propName];
                if (propValue !== true) {
                    updatedCookie += "=" + propValue;
                }
            }
            document.cookie = updatedCookie;

            if (typeof(callback) === 'function') {
                callback();
            }
        }

        /**
         * @name deleteCookie
         * @description Delete cookie
         * @param {string} name
         */
        function deleteCookie(name) {
            setCookie(name, "", {
                expires: -1
            }, function () {
            });
        }
    }
})(jQuery);