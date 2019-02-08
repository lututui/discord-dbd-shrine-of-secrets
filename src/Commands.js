const { RichEmbed } = require('discord.js');

const { T, setLocale } = require('./Translate.js');
const Misc = require('./Misc.js');

function cmdHelp(Client, channel, id) {
    const re = new RichEmbed();

    re.setTitle(T("Shrine of Secrets Bot Help", id));
    re.setThumbnail(Client.user.avatarURL);
    re.setDescription(T("Command list and descriptions. If you have any issues, report [here]", id) + '(' + Misc.REPORT_ISSUE_LINK + ')');
    re.addBlankField();

    re.addField("help", T("Shows help", id));
    re.addField("shrine", T("Displays shrine of secrets content and refresh timer", id));
    re.addField("refresh", T("Displays shrine of secrets refresh timer", id));

    channel.send(re);
}

function cmdLocale(localeString, id) {
    setLocale(localeString, id);
}

function cmdShrine(channel, id, perk_list) {
    perk_list.forEach(perk => {
        const re = new RichEmbed();

        re.setImage(perk.getTeachableImage(), true);
        re.addField(T("Perk", id), Misc.attachWikiLink(perk.getName()), true);
        re.addField(T("Cost", id), perk.getCost(), true);
        re.addField(T("Unique Of", id), Misc.attachWikiLink(perk.getOwner()), true);
            
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