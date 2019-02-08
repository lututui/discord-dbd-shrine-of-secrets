const localeConfig = {};
const localeData = require('../locale/locale.json');

function T(string, guildUID) {
    if (guildUID in localeConfig && 
         string in localeData &&
         localeConfig[guildUID] in localeData[string]) {
        return localeData[string][localeConfig[guildUID]];
    }

    return string;
}

function setLocale(localeString, guildUID) {
    localeConfig[guildUID] = localeString;
}

module.exports = { T , setLocale };