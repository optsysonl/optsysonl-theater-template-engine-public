define([], function () {
    window.TicketModel = BaseModel.extend({
        idAttribute: "id",
        initialize: function (attributes) {
            if (attributes) {
                this.set({ quantity: 0 });
                this.set({ totalPrice: 0.00 });
                this.bind("change:quantity", this.attributesChanged);
            };

            this.localize = window.ObjectCollections.Localization.result;
        },

        attributesChanged: function () {
            var total = parseFloat(Math.round((this.get('quantity') * this.get('price')) * 100) / 100).toFixed(2);
            this.set({ totalPrice: total });
        },

        getTotalPrice: function () {
            return parseFloat(this.get('totalPrice'));
        },

        getPrice: function () {
            return parseFloat(this.get('price'));
        },
        getTotalPriceDisplay: function (culture) {
            var p = this.getTotalPrice();
            if (p > 0)
                return Globalize.format(p, "c", culture);
            return "";
        },
        getPriceDisplay: function (culture) {
            var p = this.getPrice();
            var formatedPrice = Globalize.format(p, "c", culture) + ' ' + this.localize.ea;

            if (p > 0) {
                return this.get('discountFlag') && this.get('ticketValidationRuleId') != 99 ? this.localize.coupon + ' ' + formatedPrice : formatedPrice;
            } else {
                return this.get('discountFlag') && this.get('ticketValidationRuleId') != 99 ? this.localize.coupon : this.localize.forFree
            };
        },
        getNameDisplay: function () {
            var p = this.get('isOnHoldTicketType');
            if (p)
                return this.localize.holdExtraSeatsForFriends;
            else return this.get('name');
        },
        maxTicketsLimitReached: function () {
            return !(this.get('isOnHoldTicketType') && this.collection.maxOnHoldTickets > this.collection.getOnHoldTicketQuantity() ||
                !this.get('isOnHoldTicketType') && this.collection.maxTickets > this.collection.getSelectedTicketQuantity());
        },
        addTicket: function (showErrorMessage) {
            var ticketIncrement = this.get('volume') || 1;

            if (this.get('isOnHoldTicketType') && this.collection.maxOnHoldTickets + 1 > this.collection.getOnHoldTicketQuantity() + ticketIncrement ||
              !this.get('isOnHoldTicketType') && this.collection.maxTickets + 1 > this.collection.getSelectedTicketQuantity() + ticketIncrement) {
                this.set('quantity', this.get('quantity') + ticketIncrement);

                return true;
            } else if (!this.get('isOnHoldTicketType') && this.collection.maxTickets + 1 <= this.collection.getSelectedTicketQuantity() + ticketIncrement && showErrorMessage) {
                var maxTicketToString = this.collection.maxTickets.toString();
                var limitOfTickets = $.sprintf(this.localize.limitOfTicketsPerOrder, maxTicketToString);

                window.showAlert(limitOfTickets);
            } else if (this.get('isOnHoldTicketType') && this.collection.maxOnHoldTickets + 1 <= this.collection.getOnHoldTicketQuantity() + ticketIncrement && showErrorMessage) {
                var maxOnHoldTicketToString = this.collection.maxOnHoldTickets.toString();
                var limitOfHoldTickets = $.sprintf(this.localize.limitOfHoldTicketsPerOrder, maxOnHoldTicketToString);

                window.showAlert(limitOfHoldTickets);
            }
            return false;
        },
        removeTicket: function () {
            if (this.get('quantity') > 0) {
                var ticketIncrement = this.get('volume') || 1;

                this.set('quantity', this.get('quantity') - ticketIncrement);
                return true;
            }
            return false;
        },
        addSubscriptionCard: function (cardNumber, keyValue) {
            var cardNumbers = this.get('subscriptionCardNumbers') || [];
            var currentValue = { 'number': cardNumber, 'key': keyValue };

            cardNumbers.push(currentValue);

            this.set('subscriptionCardNumbers', cardNumbers);
        },
        removeSubscriptionCard: function () {
            var cardNumbers = this.get('subscriptionCardNumbers') || [];
            cardNumbers.pop();

            if (cardNumbers.length > 0) {
                this.set('subscriptionCardNumbers', cardNumbers);
            } else {
                this.unset('subscriptionCardNumbers');
            }
        },
    });

    return window.TicketModel;
});
