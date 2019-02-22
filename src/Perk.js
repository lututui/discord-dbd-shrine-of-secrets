const MediaWikiAPI = require('./MediaWikiAPI.js');

class Perk {
    constructor(perkID, wikiapi) {
        this.perkID = perkID;
        this.wikiapi = wikiapi;
    }

    async getName() {
        if (this.name === undefined)
            this.name = await this.wikiapi.expandtemplates('sos_perk_name', [this.perkID]);
        
        return this.name;
    }

    async getOwner() {
        if (this.owner === undefined)
            this.owner = await this.wikiapi.expandtemplates('sos_perk_unique', [this.perkID]);

        return this.owner;
    }

    async getCost() {
        if (this.cost === undefined)
            this.cost = await this.wikiapi.expandtemplates('sos_perk_cost', [this.perkID]);
        
        return this.cost;
    }

    async getTeachableImage() {
        if (this.teachable_image === undefined) {
            const fileName = await this.wikiapi.expandtemplates('sos_perk_image', [this.perkID]);
            this.teachable_image = await this.wikiapi.imageinfo('File:' + fileName, 'url');
        }

        return this.teachable_image;
    }

    async getOwnerImage() {
        if (this.owner_image === undefined) {
            const fileName = await this.wikiapi.expandtemplates('sos_char_image', [this.perkID]);
			this.owner_image = await this.wikiapi.imageinfo('File:' + fileName, 'url');
		}

        return this.owner_image;
    }
}

module.exports = Perk;