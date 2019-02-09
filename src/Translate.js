const localeConfig = require('../locale/config.json');
const localeData = require('../locale/locale.json');

const fs = require('fs');

function T(string, guildUID) {
    if (guildUID in localeConfig && 
         string in localeData &&
         localeConfig[guildUID] in localeData[string]) {
        return localeData[string][localeConfig[guildUID]];
    }

    return string;
}

function setLocale(localeString, guildUID) {
    if (localeString == 'en' || localeString == 'default')
        delete localeConfig[guildUID];
    else
        localeConfig[guildUID] = localeString;
    
    fs.writeFile('./locale/config.json', JSON.stringify(localeConfig), (err) => { if (err) throw err; });
}

function getLocale(guildUID) {
    if (guildUID in localeConfig)
        return localeConfig[guildUID];
    
    return 'en';
}

module.exports = { T , setLocale, getLocale };