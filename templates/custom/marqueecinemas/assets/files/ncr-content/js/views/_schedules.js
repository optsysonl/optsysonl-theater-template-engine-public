define([
  "views/_datePicker",
  "collections/movieCollection",
  "libs/datepicker/js/bootstrap-datepicker",
  "sharedhelpers/dateTimeHelper"
  
], function (datePicker, movieCollection) {
    var view = Backbone.View.extend({
        el: 'body',
        initialize: function () {
            $('.datepicker').remove();
            $('.datepicker').unbind();
            this.vent = this.options.vent;
            this.template = null;
            this.template = _.template(this.options.schedulesTemplate);
            this.el = this.options.container;
        },

        loadDatePicker: function () {
            var date = this.options.date;
            if (window.AppProperties.SelectedDate)
                date = window.AppProperties.SelectedDate;
            var datePickerView = new datePicker({ container: "#schedule-date-filter", date: date, theaterId: this.options.theaterId, vent: this.vent, hideDatePicker: true, culture: this.options.theater.get('culture') });
            datePickerView.render(this.availableDates);
            this.template = null;
        },

        render: function () {
            var that = this,
                marginTop = 0,
                showTimeLegendOptions = that.getShowTimeLegendOptions();

            if ($(window).scrollTop() >= 270) {
                if ($(document).height() - $(window).height() - 80 >= $(window).scrollTop()) {
                    marginTop = $(window).scrollTop() - 270;
                } else {
                    marginTop = $(document).height() - $(window).height() - 340;
                }
            }

            $(window).scroll(function () {
                if ($(window).scrollTop() >= 270) {
                    if ($(document).height() - $(window).height() - 70 >= $(window).scrollTop()) {
                        $("#schedulesScroll").css("marginTop", ($(window).scrollTop() - 270) + "px");
                    } else {
                        $("#schedulesScroll").css("marginTop", ($(document).height() - $(window).height() - 340) + "px");
                    }

                } else {
                    $("#schedulesScroll").css("marginTop", "0px");
                }

            });

            if (this.options.availableDates) {
                this.availableDates = this.options.availableDates;
            } else if (that.options.theater) {
                this.availableDates = that.options.theater.get('showDates');
            }

            hidePageLoadingMessage();
            var schedulesList = _.reject(that.options.schedules.models, function (schedule) {
                return _.all(schedule.get('performances').models, function (performance) {
                    return performance.get('status') == 'L' || performance.get('status') == 'S';
                });
            });
            that.options.schedules = schedulesList;
           
            $(that.el).html(that.template({
                schedules: new movieCollection(schedulesList),
                showLegend: that.options.showLegend,
                showDateFilter: that.options.showDateFilter,
                schedulesPerLine: that.options.schedulesPerLine,
                showScheduleImage: that.options.showScheduleImage,
                showScheduleData: that.options.showScheduleData,
                date: that.options.date,
                showFullScheduleData: true,
                theaterId: this.options.theaterId,
                marginTop: marginTop,
                showTimeLegendOptions: showTimeLegendOptions,
                theater: that.options.theater,
                localize: window.ObjectCollections.Localization.result
            }));
            $('.performances').css('margin-left', '20px');
            that.loadDatePicker();
        },
        getShowTimeLegendOptions: function () {
            var that = this,
                showTimeLegendOptions = { passesAllowed: true, dDDFlag: false, imaxFlag: false, reservedSeating: false };


            _.each(that.options.schedules.models, function (schedule) {
                schedule.manageShowTimeOptions(showTimeLegendOptions);
                if (!schedule.get('passesAllowed') && showTimeLegendOptions.passesAllowed)
                    showTimeLegendOptions.passesAllowed = false;

                if (schedule.get('dDDFlag') && !showTimeLegendOptions.dDDFlag) {
                    showTimeLegendOptions.dDDFlag = true;
                }

                if (schedule.get('imaxFlag') && !showTimeLegendOptions.imaxFlag) {
                    showTimeLegendOptions.imaxFlag = true;
                }

                schedule.set("scheduleOptionsString", that.buildScheduleOptionsString(schedule));
            });

            return showTimeLegendOptions;
        },
        buildScheduleOptionsString: function (schedule) {
            var scheduleOptionsString = "[";

            if (!schedule.get('passesAllowed')) {
                scheduleOptionsString += window.ObjectCollections.Localization.result["noPasses"] + ", ";
            }
            if (schedule.get('dDDFlag')) {
                scheduleOptionsString += window.ObjectCollections.Localization.result["3d"] + ", ";
            }
            if (schedule.get('imaxFlag')) {
                scheduleOptionsString += window.ObjectCollections.Localization.result["imax"] + ", ";
            }
            if (schedule.get('reservedSeating')) {
                scheduleOptionsString += window.ObjectCollections.Localization.result["seatSelection"] + ", ";
            }

            if (scheduleOptionsString.length > 1) {
                scheduleOptionsString = scheduleOptionsString.substring(0, scheduleOptionsString.length - 2);
                scheduleOptionsString += "]";
            } else {
                scheduleOptionsString = "";
            }

            return scheduleOptionsString;
        }
    });

    return view;
});