
window.HtmlHelper = {

    getStandards: function () {
        return [
            { key: "dolbySoundFlag", friendlyName: "DOLBY" },
            { key: "dTSSoundFlag", friendlyName: "DST" },
            { key: "sDDSSoundFlag", friendlyName: "SDDS" },
            { key: "tHXSoundFlag", friendlyName: "THX" },
            { key: "dDDFlag", friendlyName: "3D" },
            { key: "imaxFlag", friendlyName: "IMAX" }];
    },

    getCinemaStandards: function (performance) {
        if (performance == undefined)
            return [];

        var standards = this.getStandards();

        var supportedStandards = [];

        for (var i = 0; i < standards.length; i++) {
            var standard;

            try {
                standard = performance.get(standards[i].key);
            } catch (e) {
                standard = performance[standards[i].key];
            }

            if (standard != undefined && standard)
                supportedStandards.push(standards[i].friendlyName);
        }
        return supportedStandards;
    }
};


