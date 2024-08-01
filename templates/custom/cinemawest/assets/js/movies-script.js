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
        };

        main();
        function main(){
            options.show_date_btns = $('.showdate-button');
            options.show_date_btns_calendar = $('.showdate-button.calendar-button');
            options.show_date_btns_calendar_datepicker = options.show_date_btns_calendar.find('#datepicker');
            options.next_available_date = $('.next-available-dates .target-date');

            prepare(function(){
                initDetepicker();
                handlers();
            });
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
                    options.pickadate.pickadate('picker').set('select', new Date($(this).data('target-date') + ' 12:00:00'));
                }
                $('.showdate-button[data-date="' + $(this).data('target-date') + '"]').trigger('click');
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
                $('.hr_film').removeClass('visible').attr('aria-hidden', true);
                $('.hr_film.' + button.data('date')).addClass('visible').attr('aria-hidden', false);
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
            updateAdvanceShowing();
            $(window).trigger('changeShowDate');
        }
        function updateAdvanceShowing(){
            // options.chosen_date
            $('.hr_film').each(function(){
                var item = $(this);
                if(item.is('.grouped_film')){
                    item.find('.item').each(function(){
                        var self = $(this);
                        if(new Date(self.data('release')) <= new Date(options.chosen_date)){
                            self.addClass('hideAdvanceShowing');
                        }else{
                            self.removeClass('hideAdvanceShowing');
                        }
                    });
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