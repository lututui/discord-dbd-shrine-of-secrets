const DBD_WIKI_PREFIX = 'https://deadbydaylight.gamepedia.com/';
const DBD_WIKI_SOS_PAGE = DBD_WIKI_PREFIX + 'Shrine_of_Secrets';
const REPORT_ISSUE_LINK = 'https://github.com/lututui/discord-dbd-shrine-of-secrets/issues';

function attachWikiLink(pageName) {
    return '[' + pageName + ']' + '(' + DBD_WIKI_PREFIX + pageName.split(' ').join('_') + ')';
}

module.exports = { DBD_WIKI_PREFIX, DBD_WIKI_SOS_PAGE, REPORT_ISSUE_LINK, attachWikiLink };