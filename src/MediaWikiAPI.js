const RequestPromise = require('request-promise');

class MediaWikiAPI {
    constructor(targetAPI) {
        this.targetAPI = targetAPI;

        if (!this.targetAPI.endsWith('?')) this.targetAPI += '?'
    }

    async parse(page, prop = 'wikitext') {
        const request = {
            uri: this.targetAPI,
            qs: {
                format: 'json',
                action: 'parse',
                prop: prop,
                page: page
            },
            json: true
        };

        return RequestPromise(request).then(it => { return it.parse[prop] });
    }

    async expandtemplates(template, args, prop = 'wikitext') {
        let joinedArgs = "";

        if (args != null)
            joinedArgs = '|' + args.join('|');

        const request = {
            uri: this.targetAPI,
            qs: {
                format: 'json',
                action: 'expandtemplates',
                prop: prop,
                text: '{{' + template + joinedArgs + '}}'
            },
            json: true
        };

        return RequestPromise(request).then(it => { return it.expandtemplates[prop] });
    }

    async imageinfo(titles, iiprop) {
        const request = {
            uri: this.targetAPI,
            qs: {
                format: 'json',
                action: 'query',
                prop: 'imageinfo',
                titles: titles,
                iiprop: iiprop,
                formatversion: '2'
            },
            json: true
        };

        return RequestPromise(request).then(it => { return it.query.pages[0].imageinfo[0][iiprop] });
    }
}

module.exports = MediaWikiAPI;