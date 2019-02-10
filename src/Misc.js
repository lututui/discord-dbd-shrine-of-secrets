const DBD_WIKI_PREFIX = 'https://deadbydaylight.gamepedia.com/';
const DBD_WIKI_SOS_PAGE = DBD_WIKI_PREFIX + 'Shrine_of_Secrets';
const REPORT_ISSUE_LINK = 'https://github.com/lututui/discord-dbd-shrine-of-secrets/issues';
const LOCALE_LINK = 'https://github.com/lututui/discord-dbd-shrine-of-secrets/tree/master/locale';

function getWikiURL(pageName) {
    return DBD_WIKI_PREFIX + pageName.split(' ').join('_');
}

function hyperlinkMarkdown(text, link) {
    return '[ ' + text + ']' + '(' + link + ')';
}

module.exports = { DBD_WIKI_PREFIX, DBD_WIKI_SOS_PAGE, REPORT_ISSUE_LINK, LOCALE_LINK, getWikiURL,
    hyperlinkMarkdown };