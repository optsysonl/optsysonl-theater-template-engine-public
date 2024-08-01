define('sharedhelpers/configurationProvider', [
], function () {
    var privacyPolicy = function () {
        return window.ChainInfo.privacyUrl() || window.appConfig.PrivacyUrl;
    };

    var chainType = function () {
        return window.ChainInfo.chainType() || (window.appConfig.ChainType || "multi");
    };

    var promotions = function () {
        return window.ChainInfo.promotions();
    };

    var theaterId = function () {
        return window.AppConfig.TheaterID;
    };

    var virtualGiftCardsDefaultSite = function () {
        return window.ChainInfo.getVirtualGiftCardsDefaultSite() == undefined ? window.appConfig.DefaultSiteVirtualGiftCards : window.ChainInfo.getVirtualGiftCardsDefaultSite();
    };

    var virtualGiftCardsDefaultSiteName = function () {
        return window.ChainInfo.getVirtualGiftCardsDefaultSiteName() == undefined ? window.appConfig.DefaultSiteNameVirtualGiftCards : window.ChainInfo.getVirtualGiftCardsDefaultSiteName();
    };

    var useVirtualGiftCardsDefaultSite = function () {
        return window.ChainInfo.useVirtualGiftCardsDefaultSite() == undefined ? window.appConfig.UseDefaultSiteVirtualGiftCards : window.ChainInfo.useVirtualGiftCardsDefaultSite();
    };

    var getVirtualGiftCardReloadValues = function () {
        return window.AppConfig.VirtualGiftCardReloadValues;
    };

    var allowVirtualGiftCardsAddExistingCard = function () {
        return window.ChainInfo.allowVirtualGiftCardsAddExistingCard() == undefined ? window.appConfig.VirtualGiftCardAddExistingCards : window.ChainInfo.allowVirtualGiftCardsAddExistingCard();
    };

    var flowElement = function (elementName, enabledFunc) {
        return { name: elementName, isEnabled: enabledFunc };
    };

    var isConssesionEnabled = function (theater) {
        if (!window.ChainInfo.concessionSalesEnabled()) {
            //Disable concessions
            return false;
        } else {
            if (!theater) {
                return window.ChainInfo.concessionSalesEnabled();
            } else {
                return theater.get('concessionsEnabled') != undefined ? theater.get('concessionsEnabled') : theater.get('concessionSalesEnabled');
            }
        }
    };

    var isKioskConcessionEnabled = function (theater) {
        return theater.get('concessionKioskSalesEnabled') != undefined ? theater.get('concessionKioskSalesEnabled') : window.appConfig.EnableConcessions;
    };

    var isTicketEnabled = function (theater) {
        if (!window.ChainInfo.ticketSalesEnabled()) {
            return false;
        } else {
            if (!theater) {
                return window.ChainInfo.ticketSalesEnabled();
            } else {
                return theater.get('ticketSalesEnabled');
            }
        }
    };

    var acceptsLoyaltyEnabled = function (theater) {
        if (!window.ChainInfo.acceptsLoyalty()) {
            return false;
        } else {
            if (!theater) {
                return window.ChainInfo.acceptsLoyalty() && window.ChainInfo.maxLoyaltyCards() > 0;
            } else {
                return theater.get('acceptsLoyalty') && theater.get('maxLoyaltyCards') > 0;
            }
        }
    };

    var allowLoyaltyManagement = function () {
        return window.ChainInfo.allowLoyaltyManagement();
    };

    var allowLoyaltySignup = function () {
        return window.ChainInfo.allowLoyaltySignup();
    };

    var maxOnHoldTickets = function (theater) {
        if (!theater) {
            return window.ChainInfo.maxOnHoldTickets();
        } else {
            return theater.get('maxHoldTickets') != undefined ? theater.get('maxHoldTickets') : theater.get('maxOnHoldTickets');
        }
    };

    var isHoldTicketsEnabled = function (theater) {
        return maxOnHoldTickets(theater) > 0;
    };

    var isEmailConfirmationEnabled = function () {
        return window.ChainInfo.allowEmailConfirmation();
    };

    var isSmsConfirmationEnabled = function () {
        return window.ChainInfo.allowSMSConfirmation();
    };

    var holdTimeInMinutesBeforeShowTime = function (theater) {
        if (!theater) {
            return window.ChainInfo.holdTimeInMinutesBeforeShowTime();
        } else {
            return theater.get('holdTimeInMinutesBeforeShowtime');
        }
    };

    var holdTimeinMinutes = function (theater) {
        if (!theater) {
            return window.ChainInfo.holdTimeInMinutes();
        } else {
            return theater.get('holdTimeInMinutes');
        }
    };

    var allowGifting = function () {
        return window.ChainInfo.allowGifting();
    };

    var allowSharing = function () {
        return window.ChainInfo.allowSharing();
    };

    var serviceChargeAmount = function () {
        return window.ChainInfo.serviceChargeAmount();
    };

    var searchRadius = function () {
        var cache = new CachingProvider();
        return cache.read("Distance") || window.ChainInfo.getDefaultSearchRadius() || 100;
    };

    var useGiftCardBalance = function () {
        return window.appConfig.EnableGiftCardBalance;
    };

    var useSimpleQrCode = function () {
        return window.appConfig.UseSimpleQrCode;
    };

    var useVirtualGiftCard = function () {
        return window.ChainInfo.allowVirtualGiftCard() == undefined ? window.appConfig.AllowVirtualGiftCard : window.ChainInfo.allowVirtualGiftCard();
    };

    var useDualCards = function () {
        return window.ChainInfo.allowDualCards() == undefined ? window.appConfig.AllowDualCards : window.ChainInfo.allowDualCards();
    };

    var getFindTheatersNumberOfWeeks = function () {
        return window.ChainInfo.getFindTheatersNumberOfWeeks() == undefined ? window.appConfig.FindTheatersNumberOfWeeks : window.ChainInfo.getFindTheatersNumberOfWeeks();
    };

    var isLoyaltyEmailRecoveryEnabled = function () {
        return window.appConfig.EnableLoyaltyEmailRecovery;
    };

    var loyaltyProgramName = function () {
        return window.ChainInfo.loyaltyProgramName();
    }

    var flowElements = [
        new flowElement('acceptsloyalty', acceptsLoyaltyEnabled()), //used to check if entering loyalty during checkout is enabled
        new flowElement('loyaltymanagement', allowLoyaltyManagement()),
        new flowElement('loyaltysignup', allowLoyaltySignup()),
        new flowElement('holdtickets', isHoldTicketsEnabled()),
        new flowElement('emailconfirmation', isEmailConfirmationEnabled()),
        new flowElement('smsconfirmation', isSmsConfirmationEnabled()),
        new flowElement('conssesion', isConssesionEnabled()),
        new flowElement('giftthisticket', allowGifting()),
        new flowElement('fbshare', allowSharing()),
        new flowElement('usevirtualgiftcard', useVirtualGiftCard())
    ];

    var getCustomFlags = function () {
        return window.ChainInfo.customFlags();
    };

    var usePwdForLoyaltyLogin = function () {
        return window.ChainInfo.usePwdForLoyaltyLogin();
    };

    var arangeFlow = function (template, callback) {
        flowElements = [
            new flowElement('acceptsloyalty', acceptsLoyaltyEnabled()), //used to check if entering loyalty during checkout is enabled
            new flowElement('loyaltymanagement', allowLoyaltyManagement()),
            new flowElement('loyaltysignup', allowLoyaltySignup()),
            new flowElement('holdtickets', isHoldTicketsEnabled()),
            new flowElement('emailconfirmation', isEmailConfirmationEnabled()),
            new flowElement('smsconfirmation', isSmsConfirmationEnabled()),
            new flowElement('conssesion', isConssesionEnabled()),
            new flowElement('giftthisticket', allowGifting()),
            new flowElement('fbshare', allowSharing()),
            new flowElement('usevirtualgiftcard', useVirtualGiftCard())
        ];

        for (var i = 0; i < flowElements.length; i++) {
            if (!flowElements[i].isEnabled) {
                template.$('[data-dynamicflow="' + flowElements[i].name + '"]').css('display', 'none');
            }
        }

        template.$('[data-dynamicflow-or]').each(function (index, domElem) {
            var assignedFlowElements = $(domElem).attr('data-dynamicflow-or').split(',');
            if (assignedFlowElements.length > 0) {
                var showIt = false;

                for (var j = 0; j < assignedFlowElements.length; j++) {

                    for (var k = 0; k < flowElements.length; k++) {
                        if (flowElements[k].name == assignedFlowElements[j]) {
                            if (flowElements[k].isEnabled) {
                                showIt = true;
                            }
                        }
                    }
                }

                if (!showIt) {
                    $(domElem).css('display', 'none');
                }
            }
        });

        var showIt = true;
        template.$('[data-dynamicflow-and]').each(function (index, domElem) {
            var assignedFlowElements = $(domElem).attr('data-dynamicflow-and').split(',');
            if (assignedFlowElements.length > 0) {
                for (var j = 0; j < assignedFlowElements.length; j++) {

                    for (var k = 0; k < flowElements.length; k++) {
                        if (flowElements[k].name == assignedFlowElements[j]) {
                            if (flowElements[k].isEnabled) {
                                showIt = true;
                            } else {
                                showIt = false;
                                break;
                            }
                        }
                    }
                }
            }
        });

        if (!showIt) {
            template.$('[data-dynamicflow-and]').css('display', 'none');
        }

        if (callback && typeof (callback) === "function") {
            callback();
        }

        return template;
    };

    return {
        useConssesion: isConssesionEnabled,
        useKioskConcession: isKioskConcessionEnabled,
        useLoyalty: acceptsLoyaltyEnabled,
        useHoldTickets: isHoldTicketsEnabled,
        useEmailConfirmation: isEmailConfirmationEnabled,
        useSMSConfirmation: isSmsConfirmationEnabled,
        useTicket: isTicketEnabled,
        arangeFlow: arangeFlow,
        flowElements: flowElements,
        chainInfo: window.ChainInfo,
        holdTimeInMinutesBeforeShowTime: holdTimeInMinutesBeforeShowTime,
        holdTimeinMinutes: holdTimeinMinutes,
        allowGifting: allowGifting,
        allowSharing: allowSharing,
        maxOnHoldTickets: maxOnHoldTickets,
        serviceChargeAmount: serviceChargeAmount,
        searchRadius: searchRadius,
        chainType: chainType,
        theaterId: theaterId,
        promotions: promotions,
        privacyPolicy: privacyPolicy,
        useGiftCardBalance: useGiftCardBalance,
        useSimpleQrCode: useSimpleQrCode,
        useVirtualGiftCard: useVirtualGiftCard,
        virtualGiftCardsDefaultSite: virtualGiftCardsDefaultSite,
        virtualGiftCardsDefaultSiteName: virtualGiftCardsDefaultSiteName,
        useVirtualGiftCardsDefaultSite: useVirtualGiftCardsDefaultSite,
        useDualCards: useDualCards,
        getFindTheatersNumberOfWeeks: getFindTheatersNumberOfWeeks,
        isLoyaltyEmailRecoveryEnabled: isLoyaltyEmailRecoveryEnabled,
        getVirtualGiftCardReloadValues: getVirtualGiftCardReloadValues,
        allowVirtualGiftCardsAddExistingCard: allowVirtualGiftCardsAddExistingCard,
        loyaltyProgramName: loyaltyProgramName,
        getCustomFlags: getCustomFlags,
        usePwdForLoyaltyLogin: usePwdForLoyaltyLogin
    };
});