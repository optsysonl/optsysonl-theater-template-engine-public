(function ($) {
    $(document).ready(function () {
        movies();
    });

    function movies(){
        var options = {
            chosen_date: null,
            show_date_btns: null,
            show_date_btns_calendar: null,
            show_date_btns_calendar_datepicker: null,
            show_date_btns_calendar_datepicker_format: 'mmm dd',
            next_available_date: null,
            pickadate: null,
            available_dates: [],
            monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            daysNames: ['Sunday','Monday',' Tuesday','Wednesday','Thursday','Friday','Saturday']
        };

        main();
        function main(){
            options.show_date_btns = $('.showdate-button');
            options.show_date_btns_calendar = $('.showdate-button.calendar-button');
            options.show_date_btns_calendar_datepicker = options.show_date_btns_calendar.find('#datepicker');
            options.next_available_date = $('.next-available-dates .target-date');

            prepareDates();
            prepare(function(){
                initDetepicker();
                handlers();
            });
            updateAdvanceShowing();
        }
        function prepareDates(){
            for(var i = 0; i < availableDates.length; i++){
                var d = new Date(availableDates[i]).getTime();
                options.available_dates[i] = d;
            }
        }
        function prepare(callback){
            changeTab(options.show_date_btns.eq(0));
            if(typeof(callback) === 'function'){
                callback();
            }
        }
        function handlers(){
            options.show_date_btns.on('click', function(){
                if (!$(this).is('.calendar-button')) {
                    options.show_date_btns_calendar.data('date', '').attr('data-date', '');
                    options.show_date_btns_calendar_datepicker.val('');
                }
                if (!$(this).is('.active') && $(this).data('date') !== '') {
                    changeTab($(this));
                }
            });
            options.next_available_date.on('click', function () {
                if($('.showdate-button[data-date="' + $(this).data('target-date') + '"]').length == 0){
                    options.show_date_btns_calendar.data('date', $(this).data('target-date')).attr('data-date', $(this).data('target-date'));
                    options.pickadate.pickadate('picker').set('select', new Date($(this).data('target-date') + 'T12:00:00'));
                }
                $('.showdate-button[data-date="' + $(this).data('target-date') + '"]').trigger('click');
            });
            $(window).on('changeShowDate', function(){
                updateAdvanceShowing();
            });
        }
        function initDetepicker() {
            let calendar_button = $('.showdate-button.calendar-button');
            let available_option = [true];
            for (let i = 0; i < availableDates.length; i++) {
                let _date = availableDates[i].split('-');
                available_option.push([_date[0], _date[1] - 1, _date[2]]);
            }
            options.pickadate = $('#datepicker').pickadate({
                format: options.show_date_btns_calendar_datepicker_format,
                formatSubmit: 'yyyy-mm-dd',
                showMonthsShort: true,
                disable: available_option,
                onSet: function (chosen_date) {
                    let _d = new Date(chosen_date.select);
                    let _mounth = ('0' + (_d.getMonth() - 0 + 1)).slice(-2);
                    let _date = ('0' + _d.getDate()).slice(-2);
                    let dateText = '' + _d.getFullYear() + '-' + _mounth + '-' + _date;
                    calendar_button.data('date', dateText).attr('data-date', dateText);
                    changeTab(calendar_button);
                }
            })
        }
        function changeTab(button) {
            $('.showdate-button.active').removeClass('active');
            button.addClass('active');
            $('.tab_seances.active').removeClass('active');
            options.chosen_date = button.data('date');

            if($('.showdates-container').length !== 0) {
                $('.hr_film.visible').removeClass('visible');
                var target = $('.hr_film.' + button.data('date'));

                if(target.length !== 0){
                    target.addClass('visible');
                }else{
                    if($('.no_showtimes_available').length !== 0){
                        $('.no_showtimes_available').addClass('visible');
                        var d = new Date(button.data('date')).getTime();
                        if(options.available_dates.length !== 0) {
                            var next_date = options.available_dates[0];
                            for (var i = 0; i < options.available_dates.length; i++) {
                                var available_date = options.available_dates[i];
                                if (d < options.available_dates[i]) {
                                    if (next_date > available_date) {
                                        next_date = available_date;
                                    }
                                }
                            }
                            var t_date = new Date(next_date);
                            var text_date = options.daysNames[t_date.getUTCDay()] + ', ' + options.monthNames[t_date.getUTCMonth()] + ' ' + t_date.getUTCDate() + ', ' + t_date.getFullYear();
                            var month = t_date.getUTCMonth() - 0 + 1;
                            month = (month < 10) ? '0' + month : month;
                            var a_day = t_date.getUTCDate();
                            a_day = (a_day <10) ? '0' + a_day : a_day;
                            var data_date = t_date.getFullYear() + '-' + month + '-' + a_day;

                            if(next_date > new Date().getTime()) {
                                $('.no_showtimes_available .next-available-dates').show();
                                $('.no_showtimes_available .target-date').text(text_date);
                                $('.no_showtimes_available .target-date').data('target-date', data_date).attr('data-target-date', data_date);
                            }else{
                                $('.no_showtimes_available .next-available-dates').hide();
                            }
                        }else{
                            $('.no_showtimes_available .next-available-dates').hide();
                        }
                    }
                }

                $(window).trigger('changeMoviesPositions');
            }

            $('.hr_tablehor').each(function () {
                let self = $(this);
                let seances = self.find('.tab_seances.' + button.data('date'));
                if (seances.length == 0) {
                    seances = self.find('.tab_seances.no-seances');
                    seances.find('.next-available-dates .item.active').removeClass('active');
                    seances.find('.' + button.data('date')).addClass('active');
                }
                seances.addClass('active');
            });
            $(window).trigger('changeShowDate');
        }
        function updateAdvanceShowing(date){
            // options.chosen_date
            $('.hr_film').each(function(){
                var item = $(this);
                if(item.is('.grouped_film')) {
                    item.find('.item').each(function () {
                        var self = $(this);
                        if (new Date(self.data('release')) <= new Date(options.chosen_date)) {
                            self.addClass('hideAdvanceShowing');
                        } else {
                            self.removeClass('hideAdvanceShowing');
                        }
                    });
                }else if(!options.chosen_date){
                    /*if(item.data('release') > item.data('container')){
                        console.log('yes', item.data('release'), today );
                        item.addClass('hideAdvanceShowing');
                    }else{
                        console.log('no',item.data('release'), today );
                        item.removeClass('hideAdvanceShowing');
                    }*/
                }else{
                    if(new Date(item.data('release')) <= new Date(options.chosen_date)){
                        item.addClass('hideAdvanceShowing');
                    }else{
                        item.removeClass('hideAdvanceShowing');
                    }
                }

            });
        }

    }
})(jQuery);