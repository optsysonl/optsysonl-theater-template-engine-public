define([
  'text!templates/_datePicker.html'
], function (template) {
    var view = Backbone.View.extend({
        template: _.template(template),

        initialize: function () {
            $('.datepicker').removeData().off();
            this.vent = this.options.vent;
            this.hideDatePicker = this.options.hideDatePicker;
        },

        render: function (availableDates) {
            var that = this;

            var showDate = that.bootstrapDateFormat(that.options.date, that.options.culture);
            that.$el.html(that.template({ date: showDate, theaterId: that.options.theaterId }));

            $(that.options.container).empty().append(that.$el);

            var startDate = "+0d";
            var currentDate = new Date();
            if (currentDate.getHours() >= 0 && currentDate.getHours() <= 5) {
                startDate = "-1d";
            }

            $('.datepicker').bootstrapDatePicker({ startDate: startDate });

            var theaterId = $('.datepicker').attr('data-theaterId');
            $('.datepicker').on('show', function () {
                setTimeout(function () { fill(); }, 10);
            });

            if (window.AppProperties.SelectedDate) {
                $('#dp3').bootstrapDatePicker('update', window.AppProperties.SelectedDate);
                $('#filter-date').val(that.bootstrapDateFormat(window.AppProperties.SelectedDate, that.options.culture));
            }

            function fill() {
                var date = $('.bootstrapDatePicker-days:visible table .switch').html();
                var dateArray = date.split(" ");

                date = new Date(dateArray[0] + ',1 ,' + dateArray[1]);
                var month = ('0' + (parseInt(date.getMonth()) + 1)).slice(-2);

                $('.bootstrapDatePicker-days:visible table tr .day').each(function (index, item) {
                    var day = ('0' + $(item).html()).slice(-2);
                    var dmy = date.getFullYear() + month + day;

                    //TODO: This is ugliest solution possible. This whole logic should be refactored. [Emir] 2013/03/15
                    var actualDate = new Date(date.getFullYear(), date.getMonth(), day);

                    if ($.inArray(dmy, availableDates) < 0 || (actualDate < new Date().setHours(0, 0, 0, 0) && DtHelper.getBussinessDate(new Date(), true) != dmy)) {
                        $(item).addClass('disabled').addClass('noShowTime');

                    } else {
                        $(item).addClass('showTime');
                    }
                    if ($(item).hasClass('old') || $(item).hasClass('new')) {
                        $(item).css('visibility', 'hidden');
                    }
                });
            }

            $('.bootstrapDatePicker-days table tr .next').on('click', function () {
                setTimeout(function () {
                    fill();
                }, 10);
            });

            $('.bootstrapDatePicker-days table tr .prev').on('click', function () {
                setTimeout(function () {
                    fill();
                }, 10);
            });

            $('.datepicker').on('changeMonth', function () {
                setTimeout(function () {
                    fill();
                }, 10);
            });


            $('.datepicker').on('changeDate', function (ev) {
                window.AppProperties.SelectedDate = ev.date;
                $(".bootstrapDatePicker").css("display", "none");
                that.vent.trigger('dateChanged', theaterId);
                $('#dp3').bootstrapDatePicker('update', ev.date);
                $('#filter-date').val(that.bootstrapDateFormat(ev.date, that.options.culture));
            });

            $('.datepicker').on('hide', function (ev) {
                $('#dp3').bootstrapDatePicker('update', ev.date);
                $('#filter-date').val(that.bootstrapDateFormat(ev.date, that.options.culture));
            });

            return that;
        },

        bootstrapDateFormat: function (date, cultureSelector) {
            var dateSuffix = "",
            newDate = new Date(date);

            if (newDate.getDate() == DtHelper.getCurrentBusinessDate().getDate()) {
                dateSuffix = window.ObjectCollections.Localization.result['today'] || "";
            }

            var day = Globalize.format(newDate, "ddd");
            return day + ', ' + Globalize.format(newDate, 'D', cultureSelector) + dateSuffix;
        }
    });

    return view;
});