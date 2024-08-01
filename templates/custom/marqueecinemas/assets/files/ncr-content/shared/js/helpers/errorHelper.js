define('sharedhelpers/errorHelper', [
], function () {

    window.ErrorHelper = (function () {
        var localize = window.ObjectCollections.Localization.result;

        var errorCodes = {
            Success: 0,
            NoPendingSale: 1,
            TotalTicketQuantityExceeded: 2,
            NotAValidTheaterId: 3,
            TheaterDoesNotAllowTicketSales: 4,
            NotAValidTicketType: 5,
            SiteBusy: 6,
            NoSaleItemsToConfirm: 7,
            InvalidPaymentCardNumber: 8,
            CommunicationError: 9,
            NoResponseFromSite: 10,
            SiteReturnedInvalid: 11,
            NotEnoughTicketsAvailable: 12,
            SiteReturnedDeclined: 13,
            UserExists: 14,
            ConfirmPasswordDoesNotMatch: 15,
            Error: 16,
            NotAValidUserId: 17,
            NewPasswordSameAsCurrentPassword: 18,
            OldPasswordDoesNotMatch: 19,
            NotAValidRoleType: 20,
            NotAValidRoleId: 21,
            RoleIsNotALimitedFrontEndAPIRole: 22,
            NotAValidTheaterGroupId: 23,
            CannotDeleteSystemAdmin: 24,
            NotAValidPerformanceNumber: 25,
            ScheduleNoLongerValid: 26,
            CardDeclined: 27,
            ExpiredPaymentCard: 28,
            InvalidAVS: 29,
            InvalidCVV2: 30,
            SaleTimeOut: 31,
            SaleWasCanceled: 32,
            SaleHasBeenConfirmed: 33,
            UserDoesNotHaveRole: 34,
            NoCommunicationChannelOpen: 35,
            FeatureIDNotValid: 36,
            CommunicationTimedout: 37,
            CardNameMismatch: 38,
            NoOnlineConcessions: 39,
            NotAReservedSeatingPerformance: 40,
            InvalidGeoLocation: 41,
            InvalidLoyaltyPassword: 51,
            HoldOnsiteAdvanceDayTickets: 101,
            CannotFindCard: 102,
            HoldRemoteAdvanceDayTickets: 103,
            HoldHourlyTickets: 104,
            HoldRemoteCurrentDayTickets: 105,
            NotAValidRequest: 106,
            CardRenewalRequired: 107,
            DuplicateCardExist: 108
        };

        var getMsgByErrorCode = function (errorCode) {
            var msg;
            switch (errorCode) {
                case 0:
                    {
                        msg = localize.errorCode00;
                        break;
                    }

                case 1:
                    {
                        msg = localize.errorCode01;
                        break;
                    }

                case 2:
                    {
                        msg = localize.errorCode02;
                        break;
                    }

                case 3:
                    {
                        msg = localize.errorCode03;
                        break;
                    }

                case 4:
                    {
                        msg = localize.errorCode04;
                        break;
                    }

                case 5:
                    {
                        msg = localize.errorCode05;
                        break;
                    }

                case 6:
                    {
                        msg = localize.errorCode06;
                        break;
                    }

                case 7:
                    {
                        msg = localize.errorCode07;
                        break;
                    }

                case 8:
                    {
                        msg = localize.errorCode08;
                        break;
                    }

                case 9:
                    {
                        msg = localize.errorCode09;
                        break;
                    }

                case 10:
                    {
                        msg = localize.errorCode10;
                        break;
                    }

                case 11:
                    {
                        msg = localize.errorCode11;
                        break;
                    }

                case 12:
                    {
                        msg = localize.errorCode12;
                        break;
                    }

                case 13:
                    {
                        msg = localize.errorCode13;
                        break;
                    }

                case 14:
                    {
                        msg = localize.errorCode14;
                        break;
                    }

                case 15:
                    {
                        msg = localize.errorCode15;
                        break;
                    }

                case 16:
                    {
                        msg = localize.errorCode16;
                        break;
                    }

                case 17:
                    {
                        msg = localize.errorCode17;
                        break;
                    }

                case 18:
                    {
                        msg = localize.errorCode18;
                        break;
                    }

                case 19:
                    {
                        msg = localize.errorCode19;
                        break;
                    }

                case 20:
                    {
                        msg = localize.errorCode20;
                        break;
                    }

                case 21:
                    {
                        msg = localize.errorCode21;
                        break;
                    }

                case 22:
                    {
                        msg = localize.errorCode22;
                        break;
                    }

                case 23:
                    {
                        msg = localize.errorCode23;
                        break;
                    }

                case 24:
                    {
                        msg = localize.errorCode24;
                        break;
                    }

                case 25:
                    {
                        msg = localize.errorCode25;
                        break;
                    }

                case 26:
                    {
                        msg = localize.errorCode26;
                        break;
                    }

                case 27:
                    {
                        msg = localize.errorCode27;
                        break;
                    }

                case 28:
                    {
                        msg = localize.errorCode28;
                        break;
                    }

                case 29:
                    {
                        msg = localize.errorCode29;
                        break;
                    }

                case 30:
                    {
                        msg = localize.errorCode30;
                        break;
                    }

                case 31:
                    {
                        msg = localize.errorCode31;
                        break;
                    }

                case 32:
                    {
                        msg = localize.errorCode32;
                        break;
                    }

                case 33:
                    {
                        msg = localize.errorCode33;
                        break;
                    }

                case 34:
                    {
                        msg = localize.errorCode34;
                        break;
                    }

                case 35:
                    {
                        msg = localize.errorCode35;
                        break;
                    }

                case 36:
                    {
                        msg = localize.errorCode36;
                        break;
                    }

                case 37:
                    {
                        msg = localize.errorCode37;
                        break;
                    }

                case 38:
                    {
                        msg = localize.errorCode38;
                        break;
                    }

                case 39:
                    {
                        msg = localize.errorCode39;
                        break;
                    }

                case 40:
                    {
                        msg = localize.errorCode40;
                        break;
                    }

                case 41:
                    {
                        msg = localize.errorCode41;
                        break;
                    }
                case 42:
                    {
                        msg = localize.errorCode42;
                        break;
                    }

                case 43:
                    {
                        msg = localize.errorCode43;
                        break;
                    }

                case 44:
                    {
                        msg = localize.errorCode44;
                        break;
                    }

                case 45:
                    {
                        msg = localize.errorCode45;
                        break;
                    }

                case 46:
                    {
                        msg = localize.errorCode46;
                        break;
                    }

                case 51:
                    {
                        msg = localize.errorCode51;
                        break;
                    }

                default:
                    {
                        msg = localize.errorCode16;
                        break;
                    }

            };

            return msg;
        };

        var showAlertByErrorCode = function (errorCode, callback) {
            //Check if this is called from mobile and if it is set pointer events to default value
            if (isMobileDevice()) {
                $('[data-role=page]').css({ 'pointer-events': '' });
                $("div[data-role='content']").css({ 'pointer-events': '' });
            }
            if (callback)
                showAlert(getMsgByErrorCode(errorCode), { postBack: callback });
            else
                showAlert(getMsgByErrorCode(errorCode));
        };

        return {
            errorCodes: errorCodes,
            getMsgByErrorCode: getMsgByErrorCode,
            showAlertByErrorCode: showAlertByErrorCode
        };
    });
})