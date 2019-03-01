const RequestPromise = require('request-promise');

const _submit = Symbol('submit');

class MediaWikiAPI {
    constructor(api) {
        this.api = api;
    }

    [_submit](options) {
        options.json = true;
        options.uri = this.api;

        return RequestPromise(options);
    }

    async parse(page, prop = 'wikitext') {
        const options = {
            qs: {
                format: 'json',
                action: 'parse',
                prop: prop,
                page: page
            },
        };

        return this[_submit](options).then(it => { return it.parse[prop] });
    }

    async expandtemplates(template, args, prop = 'wikitext') {
        const options = {
            qs: {
                format: 'json',
                action: 'expandtemplates',
                prop: prop,
                text: '{{' + template + ((args != null) ? '|' + args.join('|') : "") + '}}'
            },
        };

        return this[_submit](options).then(it => { return it.expandtemplates[prop] });
    }

    async imageinfo(titles, iiprop) {
        const options = {
            qs: {
                format: 'json',
                action: 'query',
                prop: 'imageinfo',
                titles: titles,
                iiprop: iiprop,
                formatversion: '2'
            },
        };

        return this[_submit](options).then(it => { return it.query.pages[0].imageinfo[0][iiprop] });
    }
}

module.exports = MediaWikiAPI;