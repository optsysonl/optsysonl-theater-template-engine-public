(function($){
    $(document).ready(function(){
        showtimes();
    });
    function showtimes(){
        var options = {
            _window: null,
            _wrapper: null,
            _container: null,
            _film_item: null,
            active_film_item: null,
            films_data: [],
            container_height: 0,
            container_sticky_position_top: 0,
            container_position_top: 0,
            film_item_length: 0,
            active_film: 0
        };

        main();
        function main(){
            options._window = $(window);
            options._wrapper = $('.sticky-tab-seances-wrapper');
            options._container = options._wrapper.find('.sticky-tab-seances');
            options._film_item = $('.hr_film');

            prepare(function(){
                handlers();
            });
        }
        function prepare(callback){
            calculateData();

            options.film_item_length = options._film_item.length;

            getFilmsPositions(function(){
                let start_index = 0;
                let _scroll = $(window).scrollTop();
                for(var i = 0; i < options.films_data.length; i++){
                    let item = options.films_data[i];
                    if(_scroll > item.start){
                        start_index = i;
                    }
                }
                options.active_film = start_index;
                options.active_film_item = getActiveFilmItem();

                if(typeof(callback) == 'function'){
                    callback();
                }
            });
        }
        function calculateData(){
            options.container_height = options._container[0].clientHeight;
            if($(window).width() < 981 && !$('#header').is('.sticky')){
                $('#header').addClass('sticky');
                options.container_position_top = $('#header')[0].clientHeight;
                $('#header').removeClass('sticky');
            }else{
                options.container_position_top = $('#header')[0].clientHeight;
            }
            options.container_sticky_position_top = options._container.parent('.sticky-tab-seances-wrapper').offset().top - options.container_position_top;
            options.film_sticky_position_top = options.container_position_top + options.container_height;
            options._container.css({
                top: options.container_position_top
            });
        }
        function handlers(){
            $(window).on('changeMoviesPositions',function(){
                setTimeout(function(){
                    prepare();
                },300);
            });

            $(window).on('changeShowDate', function(){
                calculateData();
                getFilmsPositions();
            });
            $(window).on('resize', function(){
                calculateData();
                getFilmsPositions();
            });

            let _scroll = 0;
            options._window.on('scroll', function(){
                let current_position = options._window.scrollTop();
                let scrollDirection = (_scroll < current_position) ? 'down' : 'up';

                _scroll = current_position;
                if(_scroll >= options.container_sticky_position_top){
                    stickShowtimes();
                }else{
                    unstickShowtimes();
                }

                let active_film_data = options.films_data[options.active_film];
                let _top = options.active_film_item.find('.stick-film-item-container').data('top');
                if(scrollDirection === 'down'){
                    if(_scroll > active_film_data.end){
                        hideStickyFilm();
                        options.active_film = changeFilmIndex('increase');
                        options.active_film_item.find('.stick-film-item-container').css({
                            "top": $(this).data('top')
                        });
                        options.active_film_item = getActiveFilmItem();
                    }else if(_scroll > active_film_data.slide){
                        let updated_top = _top + (active_film_data.slide - _scroll);
                        updated_top = (updated_top < _top - active_film_data.space) ? _top - active_film_data.space : updated_top;
                        options.active_film_item.find('.stick-film-item-container').css({
                            'top': updated_top
                        });
                    }else if(_scroll > active_film_data.start){
                        showStickyFilm();
                    }
                }else{
                    if(_scroll < active_film_data.start){
                        hideStickyFilm();
                        options.active_film = changeFilmIndex('decrease');
                        options.active_film_item = getActiveFilmItem();
                    }else if(_scroll < active_film_data.end && _scroll > active_film_data.slide){
                        let updated_top = _top - (_scroll - active_film_data.slide);
                        updated_top = (updated_top > _top) ? _top : updated_top;
                        options.active_film_item.find('.stick-film-item-container').css({
                            'top': updated_top
                        });
                        showStickyFilm();
                    }else if(_scroll < active_film_data.end){
                        showStickyFilm();
                    }
                }
            });
        }

        /**
         * @name getFilmsPositions
         * @description Build films data
         */
        function getFilmsPositions(callback){
            let index = 0;
            options._film_item.each(function(){
                let item = $(this);
                let next_item = null;
                let _start = 0;
                let _end = 0;
                let _slide = 0;
                let _height = item.find('.stick-film-item-container')[0].clientHeight;

                item.find('.stick-film-item-container').css({top: options.film_sticky_position_top});
                item.find('.stick-film-item-container').data({top: options.film_sticky_position_top});
                item.data('top-space', _height);
                item.attr('data-index', index).data('index', index);

                _start = item.offset().top - options.film_sticky_position_top;

                if(item.next('.hr_film').length == 0){
                    _slide = _start + item.find('.hr_tablehor.showtimes')[0].clientHeight;
                    _end = _start + item[0].clientHeight;
                }else{
                    next_item = item.next('.hr_film');
                    _slide = next_item.offset().top - options.film_sticky_position_top - _height;
                    _end = next_item.offset().top - options.film_sticky_position_top;
                }

                options.films_data[index] = {
                    "start": _start,
                    "slide": _slide,
                    "end": _end,
                    "space": _height
                }
                index++;
            });

            if(typeof(callback) === 'function' ){
                callback();
            }
        }

        /**
         * @name changeFilmIndex
         * @description Set new film index.
         * @param {string|integer} index
         * @returns {number}
         */
        function changeFilmIndex(index){
            let new_index = 0;
            switch(index){
                case 'increase':
                    new_index = (options.active_film >= options.film_item_length - 1) ? options.active_film : options.active_film + 1;
                    break;
                case 'decrease':
                    new_index = (options.active_film === 0) ? options.active_film : options.active_film - 1;
                    break;
                default:
                    if(typeof(index) == 'integer'){
                        if(options.active_film >= options.film_item_length - 1){
                            new_index = options.film_item_length - 1;
                        }else if(options.active_film < 0){
                            new_index = 0;
                        }else{
                            new_index = index;
                        }
                    }
                    break;
            }
            return new_index;
        }

        /**
         * @name showStickyFilm
         * @description Display sticky film
         */
        function showStickyFilm(){
            options.active_film_item.addClass('sticky');
            options.active_film_item.find('.film-item-inner').css({
                'padding-top': options.films_data[options.active_film].space
            });
        }

        /**
         * @name hideStickyFilm
         * @desription Hide sticky film
         */
        function hideStickyFilm(){
            options.active_film_item.removeClass('sticky');
            options.active_film_item.find('.film-item-inner').css({
                'padding-top': 0
            });
        }

        /**
         * @name getActiveFilmItem
         * @description Get film element by active film index
         * @returns {*|HTMLElement}
         */
        function getActiveFilmItem(){
            return $('.hr_film[data-index="'+options.active_film+'"]');
        }

        /**
         * @name stickShowtimes
         * @description Skicky showtimes panel
         */
        function stickShowtimes(){
            options._wrapper.css('padding-top', options.container_height);
            options._container.addClass('sticky');
        }

        /**
         * @name unstickShowtimes
         * @description Unstick showtimes panel.
         */
        function unstickShowtimes(){
            options._wrapper.css('padding-top', 0);
            options._container.removeClass('sticky');
        }
    }
})(jQuery);