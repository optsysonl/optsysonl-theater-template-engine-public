
define(["models/seatModel", "collections/zoneCollection", "collections/seatMessageCollection", 'sharedhelpers/errorHelper'], function (SeatModel, ZoneCollection, SeatMessageCollection) {
    window.SeatCollection = BaseCollection.extend({
        model: SeatModel,
        performanceNumber: "",
        totalRowCount: 0,
        totalColumnCount: 0,
        theaterId: "",

        zones: null,

        getSelectedSeats: function () {
            if (!this.selectedSeats) {
                this.selectedSeats = new SeatCollection();
                this.selectedSeats.comparator = function (item) {
                    return item.get("recId");
                };
            };
            this.selectedSeats.sort();
            return this.selectedSeats;
        },
        initialize: function (arg) {
            if (arg) {
                this.performanceId = arg.performanceId;
                this.theaterId = arg.theaterId;
            }
            this.selectedSeats = null;
            this.zones = null;
        },
        comparator: function (item) {
            if (item)
                return parseInt(item.get("column")) || 0;
        },
        colors: ['#AB08F0', '#8C0715', '#0CC0ED', '#FFA719', '#835610', '#335610', '#835110', '#331610', '#235610'],

        addZoneColor: function (zones) {
            var j = 0;
            for (var i = 0; i < zones.length; i++) {
                if (j == this.colors.length)
                    j = 0;
                zones[i].color = this.colors[j];
                j++;
            }
        },

        addZoneClass: function (zones) {
            for (var i = 0; i < zones.length; i++) {
                zones[i].zoneClass = 'zone-' + i.toString();
            }
        },
        parse: function (resp) {
            this.selectedSeats = null;
            this.zones = null;
            this.totalRowCount = resp.result.totalRowCount;
            this.totalColumnCount = resp.result.totalColumnCount;
            this.addZoneClass(resp.result.zones);
            this.zones = new ZoneCollection(resp.result.zones);

            this.seateMessages = new SeatMessageCollection(resp.result.seatMessages);
            return resp.result.seats;
        },

        url: function () {
            return this.RESTUri + "theaters/" + this.theaterId + "/performances/" + this.performanceId + "/layout";
        },
        isAddedSeat: function (seat) {
            if (!this.selectedSeats)
                this.selectedSeats = new SeatCollection();

            var sel = this.selectedSeats.where({ name: seat.get("name") });
            return sel.length > 0;
        },
        addSeat: function (seat) {
            var recId = 0;
            var lastSeat = _.last(this.selectedSeats.models);

            if (lastSeat) {
                recId = parseInt(lastSeat.get('recId')) || 0;
            };
            recId++;
            seat.set('recId', recId);
            this.selectedSeats.add(seat);
        },
        removeSeat: function (seat) {
            this.selectedSeats.remove(seat);
        },

        getNamesOfSelectedSeats: function () {
            var html = "";
            if (this.selectedSeats) {
                _.each(this.selectedSeats.models, function (item) {
                    var seat = item;
                    var name = seat.get('name');
                    if (html == '')
                        html = name;
                    else html += ', ' + name;

                });
            };

            return html;
        },

        getTotalFeeSelectedSeats: function () {
            var totalFee = 0.00;
            if (this.selectedSeats) {
                _.each(this.selectedSeats.models, function (item) {
                    var seat = item;
                    var fee = parseFloat(seat.get('seatFee')) || 0.00;
                    totalFee += fee;

                });
            };

            return totalFee;
        },

        getSeats: function (theaterId, performanceNumber, callback) {
            this.performanceId = performanceNumber;
            this.theaterId = theaterId;
            this.fetch({
                success: function (result) {
                    callback(result);
                },
                error: function () {
                    callback();
                }
            });
        }

    });

    // Returns the Model class
    return window.SeatCollection;
});