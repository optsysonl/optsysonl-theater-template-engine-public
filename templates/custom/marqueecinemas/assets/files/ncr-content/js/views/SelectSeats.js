define(['text!templates/SelectSeats.html',
        'collections/seatCollection',
        'views/_seatKey',
        'sharedhelpers/selectSeatsHelper',
        'jqueryUI',
        'sharedlibs/openlayer/OpenLayers.mobile',
    ﻿    'helpers/CountdownHelper'
], function (template, seatCollection, seatKeyView, seatsHelper) {

    var view = Backbone.View.extend({
        el: 'body',
        template: _.template(template),
        initialize: function () {
            this.pageRendered = false;
            this.firstLoad = true;

            this.showLoveSeat = null;
            this.showCompanion = null;
            this.showWheelChair = null;
            this.notificationTimeout = null;
            this.totalFee = 0;

            this.vent = this.options.vent;
            this.localize = window.ObjectCollections.Localization.result;
            OpenLayers.Feature.Vector.style['default']['strokeWidth'] = '2';
            if (window.ObjectModels.OrderModel != null) {
                this.tickets = window.ObjectModels.OrderModel.get('tickets');
                this.seatStatuses = window.ObjectModels.OrderModel.get('seatStatuses');
                this.saleId = window.ObjectModels.OrderModel.get('saleId');

                for (var i = 0; i < this.tickets.models.length; i++) {
                    var currTicketType = this.tickets.models[i];
                    currTicketType.unset('seats', { silent: true });
                    var volume = currTicketType.get('volume') || 1;
                    if (currTicketType.get('isReservedSeating') || currTicketType.get('isOnHoldTicketType')) {
                        currTicketType.set('remaining', (currTicketType.get('quantity')*volume), { silent: true });
                    }
                }
            }
            this.modalMode = false;
        },
        render: function (arg) {
            this.el = this.options.container;
            this.performanceId = arg.performanceId,
            this.theaterId = arg.theaterId;
            this.collection = arg.collection;
            window.performanceLayout = this.collection;
            var totalColumnCount = this.collection.totalColumnCount;
            $(this.el).html(this.template({ localize: this.localize, performance: arg.performance, totalColumnCount: totalColumnCount }));
            CountdownHelper.initCountdown();
        },

        events: {
            'click input#skipOrCon': 'onContinue',
            'click #submitModal': 'submitModal',
            'click #makeModal': 'makeModal',
            'click #btnSeatKey': 'seatKey'
        },

        onContinue: function () {
            var that = this;

            var lockedSeats = this.seatStatuses.where({ status: 'Locked' });

            if (lockedSeats.length < this.tickets.getAllTicketQuantity())
                return;

            var callback = function (success) {
                if (success) {
                    that.vent.trigger('showNextPage', { seatsLocked: true });
                }
                else {
                    that.firstLoad = true;

                    var sentSeats = window.ObjectModels.OrderModel.get('sentSeats');

                    _.each(sentSeats, function (sentSeat) {
                        var selectSeat = that.vectors.getFeatureByFid(sentSeat.get('row') + '-' + sentSeat.get('column'));
                        selectSeat.attributes.status = sentSeat.get('status');
                        that.firstLoad = true;
                        that.selectCtrl.unselect(selectSeat);
                    });

                    that.renderPage();
                    hidePageLoadingMessage();
                    CountdownHelper.initCountdown();
                }

                window.ObjectModels.OrderModel.unset('processing');
            };

            showOverlay();
            window.ObjectModels.OrderModel.set('processing', true);

            this.tickets.lockSeats(this.saleId, callback);
        },

        renderPage: function () {
            seatsHelper.renderPage(this, true);
        },

        setLabels: function () {
            var that = this;
            var feature = $('svg g g path')[0];

            if (feature && feature.getBoundingClientRect().width > 25) {
                $('svg text[font-size="0px"]').css({ 'font-size': '11px' });
                that.labelSize = '12px';
            }
            else if (feature && feature.getBoundingClientRect().width > 15) {
                $('svg text[font-size="0px"]').css({ 'font-size': '8px' });
                that.labelSize = '8px';
            }
            else {
                $('svg text[font-size="0px"]').css({ 'font-size': '0px' });
                that.labelSize = '0px';
            }
        },

        refreshStatuses: function () {
            seatsHelper.refreshStatuses(this, { touchEvents: false });
        },

        drawSeats: function () {
            seatsHelper.drawSeats(this, { imgPath: '/assets/files/ncr-content/img/' });
        },

        getBrandStylesheet: function () {
            var styleSheet = '';
            _.each(document.styleSheets, function (item) {
                if (item.href && item.href.indexOf('brand.css') > 0)
                    styleSheet = item.rules || item.cssRules;
            });

            return styleSheet;
        },

        getZoneStyle: function (classes, className, property) {
            for (var x = 0; x < classes.length; x++) {
                if (classes[x].selectorText == className) {
                    return classes[x].style[property];
                }
            }
        },

        getSeatSizes: function () {
            var cinemaHeight = 560;
            var cinemaWidth = 720;

            var seatWidth;
            var seatHeight;
            if (cinemaHeight / window.performanceLayout.totalRowCount < cinemaWidth / window.performanceLayout.totalColumnCount) {
                seatHeight = cinemaHeight / window.performanceLayout.totalRowCount;
                seatWidth = seatHeight;
            } else {
                seatWidth = cinemaWidth / window.performanceLayout.totalColumnCount;
                seatHeight = seatWidth;
            }

            return { seatWidth: seatWidth, seatHeight: seatHeight, cinemaHeight: cinemaHeight, cinemaWidth: cinemaWidth, defaultRatio: cinemaWidth / cinemaHeight };
        },

        orginalSelectStyle: function (feature) {
            this.selectCtrl.selectStyle = { fillColor: feature.attributes.originalColor, fillOpacity: feature.attributes.originalOpacity, strokeColor: feature.attributes.originalColor, strokeOpacity: '0', strokeWidth: feature.attributes.strokeWidth, strokeLinejoin: 'round' };
        },

        setSelectStyle: function (feature) {
            var that = this;
            this.selectCtrl.selectStyle = { fillColor: feature.attributes.originalColor, fillOpacity: feature.attributes.selectedOpacity, strokeColor: feature.attributes.originalColor, strokeOpacity: feature.attributes.selectedOpacity, strokeWidth: feature.attributes.strokeWidth, strokeLinejoin: 'round', label: feature.attributes.label, fontSize: that.labelSize || '0px', fontColor: '#9C9595' };
        },

        changeStyle: function (feature) {
            var that = this;

            that.orginalSelectStyle(feature);

            if (feature.attributes.status == 'Reserved' || feature.attributes.status == 'Sold' || feature.attributes.type == 'GeneralAdmission' || feature.attributes.type == 'Blocked') {
                this.selectCtrl.selectStyle = { fillColor: feature.attributes.unavailableColor, fillOpacity: feature.attributes.originalOpacity, strokeOpacity: '0' };
                return;
            }

            that.setSelectStyle(feature);
        },

        onClickSeat: function (feature, selected) {
            var that = this;

            if (this.maxWarning) {
                that.setLabels();
                this.maxWarning = null;

                return;
            }

            //Handle unavailable seats
            if (feature.attributes.status == 'Reserved') {
                this.maxWarning = true;
                that.selectCtrl.unselect(feature);
                showAlert(this.localize.alertSeatReserved);

                return;
            } else if (feature.attributes.status == 'Sold') {
                this.maxWarning = true;
                that.selectCtrl.unselect(feature);
                showAlert(this.localize.alertSeatSold);

                return;
            } else if (feature.attributes.type == 'GeneralAdmission') {
                this.maxWarning = true;
                that.selectCtrl.unselect(feature);
                showAlert(this.localize.alertSeatGeneralAdmission);

                return;
            } else if (feature.attributes.type == 'Blocked') {
                this.maxWarning = true;
                that.selectCtrl.unselect(feature);
                showAlert(this.localize.alertSeatBlocked);

                return;
            }

            var performanceLayout = window.performanceLayout;

            if (selected && !feature.attributes.refresh && (feature.attributes.type == 'Wheelchair' || feature.attributes.type == 'Companion')) {
                var seatMessage = '';
                _.each(performanceLayout.seateMessages.models, function (message) {
                    if (feature.attributes.type == message.get('type')) {
                        seatMessage = message.get('message');
                        return;
                    }
                });
                showAlert(seatMessage);
            }

            if (feature.attributes.type == 'NotSeat') return;

            var remainingTypes = _.filter(this.tickets.models, function (model) {
                return model.get('remaining') > 0;
            });

            var ticketType = null;
            var isOnHold = false;

            if (remainingTypes.length)
                ticketType = remainingTypes[0];

            var row = feature.attributes.row;
            var column = feature.attributes.col;

            var seat = performanceLayout.where({ row: row, column: column })[0];

            var lockedSeats = $.grep(this.seatStatuses.models, function (s) {
                return s.get('status') == 'Locked' || s.get('status') == 'Hold';
            });

            if (remainingTypes.length && feature.attributes.refresh && seat.get('status').get('status') == 'Hold') {
                ticketType = _.filter(this.tickets.models, function (model) {
                    return model.get('isOnHoldTicketType');
                })[0];
            }

            // Unselect first seat and select last one
            if (selected && lockedSeats.length >= this.tickets.getAllTicketQuantity() && feature.attributes.status != 'Locked' && feature.attributes.status != 'Hold' && !feature.attributes.refresh) {
                var currentTime = null;
                var firstSeat = null;

                for (var i = 0; i < that.seatStatuses.length; i++) {
                    if (!currentTime || currentTime > that.seatStatuses.models[i].get('seat').get('lastUpdate')) {
                        currentTime = that.seatStatuses.models[i].get('seat').get('lastUpdate');
                        firstSeat = that.seatStatuses.models[i].get('seat');
                    }
                }

                if (firstSeat) {
                    firstSeat.unset('lastUpdate');

                    var seatElement = this.vectors.getFeatureByFid(firstSeat.get('row') + '-' + firstSeat.get('column'));
                    var removeSeat = that.seatStatuses.where({ row: firstSeat.get('row'), column: firstSeat.get('column') });

                    ticketType = firstSeat.get('ticket');

                    seatElement.attributes.status = '';
                    $('[id="' + seatElement.geometry.id + '"]').css({ 'fill-opacity': feature.attributes.originalOpacity });

                    if (firstSeat.has('ticket')) {
                        var ticket = firstSeat.get('ticket');
                        isOnHold = ticket.get('isOnHoldTicketType');

                        ticket.set('remaining', ticket.get('remaining') + 1, { silent: true });

                        if (ticket.get('seats').length > 1) {
                            ticket.get('seats').remove(firstSeat, { silent: true });
                        } else {
                            ticket.unset('seats');
                        }

                        firstSeat.unset('ticket', { silent: true });

                        firstSeat.get('status').set('status', '');

                        that.seatStatuses.remove(removeSeat[0]);
                    }

                    seatElement.style.fillOpacity = feature.attributes.originalOpacity;
                    seatElement.style.strokeOpacity = '0';

                    this.maxWarning = true;

                    var firstSeatZone = window.performanceLayout.zones.get(firstSeat.get('zoneId'));
                    if (!isOnHold && firstSeatZone)
                        that.totalFee -= parseFloat(firstSeatZone.get('surchargeAmount')) || 0;

                    this.selectCtrl.unselect(seatElement);
                }
            }

            var zone = window.performanceLayout.zones.get(seat.get('zoneId'));

            //Unselect a seat
            if (feature.attributes.status == 'Locked' || feature.attributes.status == 'Hold') {

                feature.attributes.status = '';
                $('[id="' + feature.geometry.id + '"]').css({ 'fill-opacity': feature.attributes.originalOpacity });

                if (seat.has('ticket')) {
                    var ticket = seat.get('ticket');
                    isOnHold = ticket.get('isOnHoldTicketType');
                    ticket.set('remaining', ticket.get('remaining') + 1, { silent: true });

                    if (ticket.get('seats').length > 1) {
                        ticket.get('seats').remove(seat, { silent: true });
                    } else {
                        ticket.unset('seats');
                    }

                    seat.unset('ticket', { silent: true });

                    seat.get('status').set('status', '');

                    seat.unset('lastUpdate');
                }

                //deselect
                feature.style.fillOpacity = feature.attributes.originalOpacity;
                feature.style.strokeOpacity = '0';

                that.maxWarning = true;
                that.selectCtrl.unselect(feature);

                that.showTicketQuantity();
                that.updateContinueButton();
                that.refreshSeatNotification(seat, zone, isOnHold, true);

                return;
            }

            if (!selected) return;

            var confirmSeatSelection = function (selectedType) {
                if (selectedType == 'Hold') {
                    feature.attributes.status = 'Hold';
                    $('[id="' + feature.geometry.id + '"]').css({ 'fill-opacity': feature.attributes.originalOpacity });
                }
                else {
                    feature.attributes.status = 'Locked';
                    $('[id="' + feature.geometry.id + '"]').css({ 'fill-opacity': feature.attributes.selectedOpacity });
                }

                var status = 'Locked';


                //on zoom for selected
                if (feature.attributes.status == 'Hold') {
                    feature.style.fillOpacity = feature.attributes.originalOpacity;
                    feature.style.strokeOpacity = feature.attributes.selectedOpacity;
                } else {
                    feature.style.fillOpacity = feature.attributes.selectedOpacity;
                    feature.style.strokeOpacity = feature.attributes.selectedOpacity;
                }

                var seatStatus = $.grep(that.seatStatuses.models, function (s) {
                    return (s.get('status') == 'Locked' || s.get('status') == 'Hold') && s.get('row') == row && s.get('column') == column;
                });

                if (seatStatus.length == 0) {
                    var stat = new PerformanceSeatInfoModel({ row: row, column: column, status: status });
                    stat.set('seat', seat, { silent: true });
                    seat.set('status', stat, { silent: true });

                    that.seatStatuses.add(stat);
                } else {
                    seatStatus[0].set('status', status);
                }

                seat.set('lastUpdate', new Date().getTime(), { silent: true });
                isOnHold = seat.get('ticket').get('isOnHoldTicketType');

                feature.attributes.refresh = false;

                that.showTicketQuantity();
                that.updateContinueButton();
                that.refreshSeatNotification(seat, zone, isOnHold, feature.attributes.refresh);
            };

            if (ticketType) {
                if (!ticketType.has('seats')) {
                    ticketType.set('seats', new SeatCollection(), { silent: true });
                }

                ticketType.get('seats').push(seat, { silent: true });

                seat.set('ticket', ticketType, { silent: true });

                ticketType.set('remaining', ticketType.get('remaining') - 1, { silent: true });

                confirmSeatSelection(ticketType.get('name'));
            }
        },

        refreshSeatNotification: function (seat, zone, isOnHold, clear) {
            var that = this;

            var container = $(that.el).find('.notification-container');

            container.css({
                'opacity': '100'
            });

            var notification = $('.notification-container').find('.notification-top-bar');
            var seatMessage = container.find('.seat-message');

            if (!isOnHold && zone) {
                var fee = parseFloat(zone.get('surchargeAmount')) || 0;
                var displayValue = Globalize.format(fee, "c", window.ObjectModels.OrderModel.get('theater').get('culture'));

                if (clear)
                    that.totalFee -= fee;
                else
                    that.totalFee += fee;

                var msg = fee == 0 ? that.localize.free : that.localize.additionalFee + displayValue;
                seatMessage.html(zone.get('message') + ' ' + msg);
            } else {
                seatMessage.html('');
            }

            var seatMessageHtml = seatMessage[0].outerHTML;
            if (clear) {
                var htmlText = $.sprintf(that.localize.removeSeatMessages,
                    seat.get('name'),
                    seatMessageHtml
                );
            } else {
                htmlText = $.sprintf(that.localize.addSeatMessages,
                    seat.get('name'),
                    seatMessageHtml
                );
            }

            notification.html(htmlText);

            if (clear) {
                notification.addClass('note-danger').removeClass('note-success');
            } else {
                notification.addClass('note-success').removeClass('note-danger');
            }

            $('#messageFee').html(that.localize.preferredFee + ' ' + Globalize.format(that.totalFee, "c", window.ObjectModels.OrderModel.get('theater').get('culture')));

            clearTimeout(that.notificationTimeout);
            that.notificationTimeout = setTimeout(function () {
                container.css({ 'opacity': '0' });
            }, 3000);
        },

        showTicketQuantity: function () {
            var lockedSeats = this.seatStatuses.where({ status: 'Locked' });

            var seatsString = "";

            for (var i = 0; i < lockedSeats.length; i++) {
                var currLockedSeat = lockedSeats[i].get('seat');

                if (!currLockedSeat) continue;

                seatsString += currLockedSeat.get('name') + ', ';
            }

            seatsString = seatsString.slice(0, -2);

            var yourSeats = this.localize.yourSeats;
            $('#selectedSeats').html(yourSeats + ": <b>" + seatsString + "</b>");

            var msg = $.sprintf(this.localize.seatSelected, lockedSeats.length, this.tickets.getAllTicketQuantity());
            $(this.el).find("#numberSeats").html(msg);
        },

        updateContinueButton: function () {
            var lockedSeats = this.seatStatuses.where({ status: 'Locked' });

            if (!this.collection || lockedSeats.length >= this.tickets.getAllTicketQuantity()) {
                $("#skipOrCon").removeAttr('disabled').addClass('btn-primary').val(this.localize.lblContinue);;
            }
            else {
                var r = this.tickets.getAllTicketQuantity() - lockedSeats.length;
                if (r > 0)
                    var msg = $.sprintf(this.localize.youMustSelectSeats);

                $("#skipOrCon").attr('disabled', 'disabled').removeClass('btn-primary').val(msg);
            }

        },

        submitModal: function () {
            $('#SelectSeatsModal').modal('hide');
        },

        makeModal: function () {
            this.parentDiv = $(this.el).parent();
            var that = this;

            $modalBody = $('#modalBody');
            $modalBody.html(this.$el.find('.SelectSeatsContainer'));

            $('#SelectSeatsModal').bind("shown", function () {
                that.modalMode = true;
                $('.SelectSeatsContainer').css('width', '100%').css('height', '100%');
                $('.selectSeatsVisible').css('width', '100%').css('height', '100%');
                $('#seats-layout').css('height', '100%').css('widht', '100%');
                var seatsLayoutParent = $('.selectSeatsVisible');
                var seatLayoutWidth = seatsLayoutParent.width() - 10;
                $('#seats-layout, svg').css({ 'width': seatLayoutWidth, 'height': seatsLayoutParent.height() });
                $('#modalBody').css('visibility', 'visible');
                that.setLabels();

            });

            $('#SelectSeatsModal').bind('hidden', function () {
                that.onclose(that);
                that.modalMode = false;
                that.setLabels();
            });
            $('#SelectSeatsModal').modal('show');
            $('#makeModal').hide();
        },

        onclose: function () {
            $('#modalBody').css('visibility', 'hidden');
            var container = $(this.$el.find('#seatsSelection'));
            var selectSeatsContainer = $('.SelectSeatsContainer');
            container.append(selectSeatsContainer);

            $('.SelectSeatsContainer').css("width", '');
            $('.selectSeatsVisible').css('width', '');

            $('#seats-layout, svg').css({ 'width': '720px', 'height': '560px' });

            $('#makeModal').show();
        },

        seatKey: function () {
            var that = this;

            var viewForSeatKey = new seatKeyView({
                container: $('#legend'),
                theater: window.ObjectModels.OrderModel.get('theater'),
                zones: that.collection.zones,
                showLoveSeat: that.showLoveSeat,
                showCompanion: that.showCompanion,
                showWheelChair: that.showWheelChair,
                localize: that.localize
            });
            viewForSeatKey.render();
            $('#modal-seatKey').modal();
            $('#legend').css('display', 'block');
        },
        dispose: function () {
            this.undelegateEvents();
            this.off();
            if (this.vent)
                this.vent.off();
        }
    });
    return view;
});