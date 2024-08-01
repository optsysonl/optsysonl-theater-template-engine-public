
var getWeekDays =
    new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday");

var getWeekDaysShort =
    new Array("Sun", "Mon", "Tue", "Wed", "Thu",
        "Fri", "Sat");

var getMonths = new Array("January", "February", "March", "April", "May", "June", "July", "August",
    "September", "October", "November", "December");

var getMonthsShort = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
    "Sept", "Oct", "Nov", "Dec");

window.DtHelper = {
    // Returns time: "1hr 45min"
    getRuntime: function (duration) {
        var hour = parseInt(duration / 60);
        var minute = duration % 60;
        var hr = (hour > 1 ? "hrs" : "hr");
        var result = hour + hr;
        if (minute > 0)
            result = result + " " + minute + "min";

        return result;
    },

    // Returns date: "Monday, October 1 (today)"

    getDateLongAdverb: function (date) {
        var that = this;
        var d = new Date(date.replace(/-/g, "/"));
        var weekDay = getWeekDaysShort;
        var monthName = getMonthsShort;
        var returnDate = weekDay[d.getDay()] + ", " + monthName[d.getMonth()] + " " + d.getDate() + " " + d.getFullYear();

        if (parseInt(that.dateDiff(d, new Date())) == 0)
            return returnDate + "(Today)";

        if (parseInt(that.dateDiff(d, new Date())) == 1)
            return returnDate + "(Tomorrow)";

        return returnDate;
    },

    getDateLong: function (date) {
        var that = this;
        var d = new Date(date);
        var weekDay = getWeekDaysShort;
        var monthName = getMonthsShort;
        var returnDate = weekDay[d.getDay()] + ", " + monthName[d.getMonth()] + " " + d.getDate() + " " + d.getFullYear();

        if (parseInt(that.dateDiff(d, new Date())) == 0)
            return returnDate + "(Today)";

        if (parseInt(that.dateDiff(d, new Date())) == 1)
            return returnDate + "(Tomorrow)";

        return returnDate;
    },

    fromIso: function (s) {
        var day, tz, rx = /^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):(\d\d))?$/;
        var p = rx.exec(s) || [];
        if (p[1]) {
            var dp = p[1].substring(0, p[1].lastIndexOf(':'));
            day = dp.split(/\D/);
            for (var i = 0, L = day.length; i < L; i++) {
                day[i] = parseInt(day[i], 10) || 0;
            };
            day[1] -= 1;
            day = new Date(Date.UTC.apply(Date, day));
            if (!day.getDate()) return NaN;
            if (p[5]) {
                tz = (parseInt(p[5], 10) * 60);
                if (p[6]) tz += parseInt(p[6], 10);
                if (p[4] == '+') tz *= -1;
                if (tz) day.setUTCMinutes(day.getUTCMinutes() + tz);
            }
            return day;
        }
        return NaN;
    },

    getTimeJson: function (jsonDate) {
        var dateTime = new Date(parseInt(jsonDate.substr(6)));
        return dateFormat(dateTime, "h:MMtt");

    },

    // Returns 1:30PM
    getShowTime: function (isoDate) {
        /*        return 'obsolete';
        var dateTime = new Date(isoDate);
        return dateFormat(dateTime, "h:MMtt");*/
        return Globalize.format(new Date(isoDate), "h:MM tt");
    },
    getShowtimeDateObject: function (isoDate, culture) {
        return { date: Globalize.format(new Date(isoDate), "h:mm", culture), period: Globalize.format(new Date(isoDate), "tt", culture) };
    },
    dateDiff: function (date1, date2) {
        var datediff = date1.getTime() - date2.getTime(); //store the getTime diff - or +
        return (datediff / (24 * 60 * 60 * 1000)); //Convert values to -/+ days and return value      
    },
    dateDiffInMinutes: function (date1, date2) {
        var datediff = date1.getTime() - date2.getTime(); //store the getTime diff - or +
        return (datediff / (60 * 1000)); //Convert values to -/+ minutes and return value      
    },
    // Converts a string date-time into Safari compatible date format
    convertDate: function (input) {
        if (input == undefined)
            return undefined;

        var format = 'yyyy-mm-ddThh:MM:ss'; // default format        
        var parts = input.match(/(\d+)/g),
            i = 0, fmt = {};

        // extract date-part indexes from the format
        format.replace(/(yyyy|dd|mm|hh|MM|ss)/g, function (part) { fmt[part] = i++; });

        var date = new Date(parts[fmt['yyyy']], parts[fmt['mm']] - 1, parts[fmt['dd']], parts[fmt['hh']], parts[fmt['MM']], parts[fmt['ss']]);
        return date;
    },

    lengthToTime: function (length) {
        var hours = (length / 60).toString().split(".")[0];
        var minutes = length % 60;

        return hours + "hr " + (minutes ? minutes + "min" : "");
    },

    // Converts YYYYMMDD to a date value
    parseDate: function (input) {
        if (!/^(\d){8}$/.test(input)) return "Invalid date";

        var y = input.substr(0, 4),
            m = parseInt(input.substr(4, 2), 10) - 1,
            d = input.substr(6, 2);

        return new Date(y, m, d);
    },
    getBussinessDate: function (date, accountForToday) {
        var d = new Date(date);
        var currentTime = new Date();
        if (accountForToday && d.getFullYear() == currentTime.getFullYear() && d.getMonth() == currentTime.getMonth() && d.getDate() == currentTime.getDate())
            d = currentTime;
        else
            d.setHours(6);
        var currentBussinesDateMax = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 5, 59);
        if (d < currentBussinesDateMax)
            d.setDate(d.getDate() - 1);
        return (Globalize.format(d, "yyyyMMdd"));
    },
    getCurrentBusinessDate: function () {
        var currentTime = new Date();
        currentTime.setHours(currentTime.getHours() - 6);
        return currentTime;
    },
    setCurrentTime: function (date) {
        var currentTime = new Date();
        date.setHours(currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds());
        return date;
    },
    getNextDays: function (nextDaysCount, includeToday, culture) {
        var dates = [];
        for (var i = 0; i < nextDaysCount; i++) {
            var nextDateModifier = includeToday ? i + 0 : i + 1;
            var today = new Date();
            var nextDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + nextDateModifier);
            dates.push({
                businessDate: this.getBussinessDate(nextDate, true),
                showDate: Globalize.format(nextDate, "d", culture),
                dayName: this.getDayName(nextDate)
            });
        }
        return dates;
    },
    getDaysFromBusinessDates: function (businessDates, culture) {
        var dates = [];
        for (var i = 0; i < businessDates.length; i++) {
            var businessDate = businessDates[i];
            var date = this.parseDate(businessDate);

            var today = new Date();
            today.setHours(0, 0, 0, 0);

            if (date >= today) {
                dates.push({
                    businessDate: businessDate,
                    showDate: Globalize.format(date, "d", culture),
                    showDateAbbr: Globalize.format(date, "m", culture),
                    showDateLong: Globalize.format(date, "M", culture),
                    dayName: this.getDayName(date),
                    shortDayName: this.getDayName(date, true)
                });
            }
        }
        return dates;
    },
    getDateFromBussinessDate: function (bussinesDate) {
        var y = bussinesDate.substring(0, 4);
        var m = bussinesDate.substring(4, 6) - 1;
        var d = bussinesDate.substring(6, 8);
        var date = new Date(y, m, d);
        return date;
    },
    getDayName: function (date, short) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (parseInt(this.dateDiff(date, today)) == 0)
            return "Today";

        if (parseInt(this.dateDiff(date, today)) == 1)
            return "Tomorrow";
        return short ? getWeekDaysShort[date.getDay()] : getWeekDays[date.getDay()];
    },
    dateDiffInYears: function (date1, date2) {
        date1 = new Date(date1);
        date2 = date2 ? new Date(date2) : new Date();

        var diff = date2 - date1;

        return diff / (24 * 60 * 60 * 1000 * 365); // Converts miliseconds difference in year difference
    }
};


