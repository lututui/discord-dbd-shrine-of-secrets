const localeConfig = {};
const localeData = require('../locale/locale.json');

function T(string, guildUID) {
    if (guildUID in localeConfig && 
         localeConfig[guildUID] !== "default" &&
         localeConfig[guildUID] in localeData &&
         string in localeData['default']) {
        return localeData[localeConfig[guildUID]][localeData['default'][string]];
    }

    return string;
}

function setLocale(localeString, guildUID) {
    localeConfig[guildUID] = localeString;
}

module.exports = { T , setLocale };