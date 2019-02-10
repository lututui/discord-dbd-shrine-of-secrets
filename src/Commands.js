const { RichEmbed } = require('discord.js');

const { T, setLocale, getLocale } = require('./Translate.js');
const Misc = require('./Misc.js');

const supportedLocale = require('../locale/supported.json');

function cmdHelp(Client, channel, id) {
    const re = new RichEmbed();

    re.setTitle(T("Shrine of Secrets Bot Help", id));
    re.setThumbnail(Client.user.avatarURL);
    re.setDescription(T("Command list and descriptions. If you have any issues, report", id) + ' ' + Misc.hyperlinkMarkdown(T("here", id), Misc.REPORT_ISSUE_LINK));
    re.addBlankField();

    re.addField("help", T("Shows help", id));
    re.addField("shrine", T("Displays shrine of secrets content and refresh timer", id));
    re.addField("refresh", T("Displays shrine of secrets refresh timer", id));

    channel.send(re);
}

function cmdLocale(channel, id, localeString) {
    const re = new RichEmbed();
    const isDefined = typeof localeString !== 'undefined' && localeString;
    const isValid = isDefined && supportedLocale.includes(localeString);

    if (isDefined && isValid) {
        setLocale(localeString, id);

        re.addField(T("Locale set success", id), T("Set this server localization to", id) + ' ' + localeString);

        channel.send(re);

        return;
    }

    if (!isDefined)
        re.addField(T("Current locale", id), getLocale(id));

    if (isDefined && !isValid)
        re.addField(T("Locale set fail", id), T("Unknown locale", id) + ' ' + localeString);

    re.addField(T("Supported locales", id), supportedLocale.join(', '));
    re.addField(T("Help Wanted!", id), T("Want to add support for a language? Click", id) + ' ' + Misc.hyperlinkMarkdown(T("here", id), Misc.LOCALE_LINK));

    channel.send(re);
}

function cmdShrine(channel, id, perk_list) {
    perk_list.forEach(perk => {
        const re = new RichEmbed();

        re.setImage(perk.getTeachableImage(), true);
        re.addField(T("Perk", id), Misc.hyperlinkMarkdown(perk.getName(), Misc.getWikiURL(perk.getName())), true);
        re.addField(T("Cost", id), perk.getCost(), true);
        re.addField(T("Unique Of", id), Misc.hyperlinkMarkdown(perk.getOwner(), Misc.getWikiURL(perk.getOwner())), true);
            
        channel.send(re);
    });
}

function cmdRefresh(channel, id) {
    const re = new RichEmbed();
    const [ timeout, timeoutString ] = getRefreshTime();

    re.addField(T("Shrine of Secrets", id), [T("The Shrine of Secrets refreshes in", id), timeout, T(timeoutString, id)].join(' '), false);
    channel.send(re);
}

function getRefreshTime() {
    const weekDay = new Date().getUTCDay();

    // Tuesday
    if (weekDay == 2) {
        return [ 24 - new Date().getUTCHours(),  "hours" ];
    } else if (weekDay > 2) {
        return [ 10 - weekDay, "days" ];
    } else {
        return [ 2 - weekDay, "days" ];
    }
}

module.exports = { cmdHelp, cmdLocale, cmdRefresh, cmdShrine };