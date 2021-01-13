const MediaWikiAPI = require('./MediaWikiAPI.js');

class Perk {
    constructor(perkID, perkName, perkOwner, perkCost, perkIconFilename, perkOwnerPortraitFilename, wikiapi) {
        this.perkID = perkID;
        this.name = perkName;
        this.owner = perkOwner;
        this.cost = perkCost;
        this.iconFilename = perkIconFilename;
        this.ownerPortraitFilename = perkOwnerPortraitFilename;
        this.wikiapi = wikiapi;
    }

    getID() {
        return this.perkID;
    }

    getName() {
        return this.name;
    }

    getOwner() {
        return this.owner;
    }

    getCost() {
        return this.cost;
    }

    async getTeachableImage() {
        if (this.teachable_image === undefined) {
            this.teachable_image = await this.wikiapi.imageinfo('File:' + this.iconFilename, 'url');
        }

        return this.teachable_image;
    }

    async getOwnerImage() {
        if (this.owner_image === undefined) {
			this.owner_image = await this.wikiapi.imageinfo('File:' + this.ownerPortraitFilename, 'url');
		}

        return this.owner_image;
    }
}

module.exports = Perk;