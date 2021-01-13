const DBD_WIKI_PREFIX = 'https://deadbydaylight.gamepedia.com/';
const DBD_WIKI_SOS_PAGE = DBD_WIKI_PREFIX + 'Shrine_of_Secrets';
const DBD_WIKI_API = DBD_WIKI_PREFIX + 'api.php';
const REPORT_ISSUE_LINK = 'https://github.com/lututui/discord-dbd-shrine-of-secrets/issues';
const LOCALE_LINK = 'https://github.com/lututui/discord-dbd-shrine-of-secrets/tree/master/locale';
const PERK_DATATABLE_DUMMY_CODE = `
MediaWiki = {}
MediaWikiFrame = {}

function MediaWiki:new(o)
    o = o or {}
    setmetatable(o, self)
    self.__index = self
    return o
end

function MediaWiki.getCurrentFrame()
    return MediaWikiFrame:new()
end



function MediaWikiFrame:new(o)
    o = o or {}
    setmetatable(o, self)
    self.__index = self
    return o
end

function MediaWikiFrame:expandTemplate(args)
    return ""
end

mw = MediaWiki:new()
`
const LUA_ARRAY_TO_TABLE = `
function arrayToTable(strKey, tbl)
    result = {}
    
    for k, v in pairs(tbl) do
        result[v[strKey]] = v
    end
    
    return result
end
`
const PERK_OWNER_PORTRAIT_FILE_SUFFIX = "_charSelect_portrait.png";

function getWikiURL(pageName) {
    return DBD_WIKI_PREFIX + pageName.split(' ').join('_');
}

function hyperlinkMarkdown(text, link) {
    return '[ ' + text + ']' + '(' + link + ')';
}

function objectMap(obj, mapFunc) {
    Object.keys(obj).map((k,v) => obj[k] = mapFunc(k, obj[k]));
    
    return obj;
}

module.exports = { 
    DBD_WIKI_PREFIX, 
    DBD_WIKI_SOS_PAGE, 
    REPORT_ISSUE_LINK, 
    LOCALE_LINK, 
    DBD_WIKI_API, 
    PERK_DATATABLE_DUMMY_CODE, 
    LUA_ARRAY_TO_TABLE, 
    PERK_OWNER_PORTRAIT_FILE_SUFFIX, 
    getWikiURL, 
    hyperlinkMarkdown,
    objectMap
};