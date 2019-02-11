const RequestPromise = require('request-promise');

class MediaWikiAPI {
    constructor(targetAPI) {
        this.targetAPI = targetAPI;

        if (!this.targetAPI.endsWith('?')) this.targetAPI += '?'
    }

    async parse(page, prop = 'wikitext') {
        const uri = this.targetAPI + 'format=json' + '&action=parse' + '&prop=' + prop + '&page=' + page;

        return RequestPromise(uri).then(it => { return JSON.parse(it).parse[prop] });
    }

    async expandtemplates(template, args, prop = 'wikitext') {
        let joinedArgs = "";

        if (args != null)
            joinedArgs = '|' + args.join('|');

        const uri = this.targetAPI + 'format=json' + '&action=expandtemplates' + '&prop=' + prop + '&text={{' + template + joinedArgs + '}}';

        return RequestPromise(uri).then(it => { return JSON.parse(it).expandtemplates[prop] });
    }

    async imageinfo(titles, iiprop) {
        const uri = this.targetAPI + 'format=json' + '&action=query' + '&prop=imageinfo' + '&titles=' + titles + '&iiprop=' + iiprop + '&formatversion=2';

        return RequestPromise(uri).then(it => { return JSON.parse(it).query.pages[0].imageinfo[0][iiprop] });
    }
}

module.exports = MediaWikiAPI;