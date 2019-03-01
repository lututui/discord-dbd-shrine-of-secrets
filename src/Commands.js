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

function cmdLocale(channel, id, localeString, isADM) {
    const re = new RichEmbed();
    const isDefined = typeof localeString !== 'undefined' && localeString;
    const isValid = isDefined && supportedLocale.includes(localeString);

    if (isDefined && isValid) {
        if (isADM) {
            setLocale(localeString, id);
            re.addField(T("Locale set success", id), T("Set this server localization to", id) + ' ' + localeString);
        } else {
            re.addField(T("Locale set fail", id), T("You are not allowed to use this command", id));
        }

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
    async function perkInfoBuild(perk) {
        return await Promise.all([perk.getName(), perk.getOwner(), perk.getCost(), perk.getTeachableImage()]);
    }

    async function perkInfoListBuild(perk_list) {
        return await Promise.all([
            perkInfoBuild(perk_list[0]), perkInfoBuild(perk_list[1]), 
            perkInfoBuild(perk_list[2]), perkInfoBuild(perk_list[3])
        ]);
    }

    perkInfoListBuild(perk_list).then(perkInfoList => {
        perkInfoList.forEach(perkInfo => {
            const re = new RichEmbed();

            re.setThumbnail(perkInfo[3], true);
            re.addField(T("Perk", id), Misc.hyperlinkMarkdown(perkInfo[0], Misc.getWikiURL(perkInfo[0])));
            re.addField(T("Cost", id), perkInfo[2]);
            re.addField(T("Unique Of", id), Misc.hyperlinkMarkdown(perkInfo[1], Misc.getWikiURL(perkInfo[1])));

            channel.send(re)
        });
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