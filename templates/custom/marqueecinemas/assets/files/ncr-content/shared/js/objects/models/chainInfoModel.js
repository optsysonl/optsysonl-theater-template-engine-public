define(["backbone"], function (Backbone) {
    window.ChainInfoModel = Backbone.Model.extend({
        urlnew: "get-chain-info.json",
        url: appConfig.RESTUri + "ChainInfo",
        name: function () {
            return this.get('name');
        },
        ticketSalesEnabled: function () {
            return this.get('ticketSalesEnabled');
        },
        concessionSalesEnabled: function () {
            return this.get('concessionsEnabled') != undefined ? this.get('concessionsEnabled') : this.get('concessionSalesEnabled');
        },
        getDefaultSearchRadius: function () {
            return this.get('defaultSearchRadius');
        },
        sVCProgramName: function () {
            return this.get('sVCProgramName');
        },
        acceptsLoyalty: function () {
            return this.get('acceptsLoyalty') == undefined || this.get('acceptsLoyalty');
        },
        allowLoyaltyManagement: function () {
            return this.get('allowLoyaltyManagement');
        },
        allowLoyaltySignup: function () {
            return this.get('allowLoyaltySignup') != undefined ? this.get('allowLoyaltySignup') : this.get('allowLoyaltyManagement');
        },
        loyaltyProgramName: function () {
            return this.get('loyaltyProgramName');
        },
        maxLoyaltyCards: function () {
            return this.get('maxLoyaltyCards');
        },
        maxOnHoldTickets: function () {
            return this.get('maxHoldTickets') != undefined ? this.get('maxHoldTickets') : this.get('maxOnHoldTickets');
        },
        holdTimeInMinutes: function () {
            return this.get('holdTimeInMinutes');
        },
        holdTimeInMinutesBeforeShowTime: function () {
            return this.get('holdTimeInMinutesBeforeShowTime');
        },
        allowGifting: function () {
            return this.get('giftingEnabled') != undefined ? this.get('giftingEnabled') : this.get('allowGifting');
        },
        allowSharing: function () {
            return this.get('allowSharing');
        },
        fbAppId: function () {
            return this.get('fbAppId'); //: "887766554433",
        },
        allowEmailConfirmation: function () {
            return this.get('allowEmailConfirmation');
        },
        allowSMSConfirmation: function () {
            return this.get('allowSMSConfirmation');
        },
        defaultSearchRadius: function () {
            return this.get('defaultSearchRadius');
        },
        defaultSearchRadiusIsInMiles: function () {
            return this.get('defaultSearchRadiusIsInMiles');
        },
        serviceChargeDescription: function () {
            return this.get('serviceChargeDescription');
        },
        serviceChargeAmount: function () {
            return this.get('serviceChargeAmount');
        },
        serviceChargeType: function () {
            return this.get('serviceChargeType');
        },
        maxServiceChargeAmount: function () {
            return this.get('maxServiceChargeAmount');
        },
        parse: function (resp) {
            this.result_code = resp.result_code;
            switch (resp.result_code) {
                case 200:
                    {
                        return resp.result;
                    }
                case 404:
                    {
                        if (resp.result_code == 404) {
                            console.log('error Chain Info Model', resp.result.message);
                            return resp;
                        };
                        break;
                    }
                default:
                    {
                        return resp;
                    }
            };
        },

        chainType: function () {
            return this.get('chainType');
        },
        promotions: function () {
            return this.get('promotions');
        },
        privacyUrl: function () {
            return this.get('privacyUrl');
        },
        allowVirtualGiftCard: function () {
            return this.get('allowVirtualGiftCards');
        },
        getVirtualGiftCardsDefaultSite: function () {
            return this.get('defaultSiteVirtualGiftCards');
        },
        getVirtualGiftCardsDefaultSiteName: function () {
            return this.get('DefaultSiteNameVirtualGiftCards');
        },
        useVirtualGiftCardsDefaultSite: function () {
            return this.get('useDefaultSiteVirtualGiftCards');
        },
        allowDualCards: function () {
            return this.get('allowDualCards');
        },
        getFindTheatersNumberOfWeeks: function () {
            return this.get('findTheatersNumberOfWeeks');
        },
        allowVirtualGiftCardsAddExistingCard: function () {
            return this.get('allowVirtualGiftCardsAddExistingCard');
        },
        customFlags: function () {
            return this.get('customFlags');
        },
        usePwdForLoyaltyLogin: function () {
            return this.get('usePwdForLoyaltyLogin');
        }
    });

    return window.ChainInfoModel;
});