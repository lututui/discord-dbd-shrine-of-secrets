class Perk {
    constructor(name, owner, cost, teachable_image, owner_image) {
        this.name = name;
        this.owner = owner;
        this.cost = cost;
        this.teachable_image = teachable_image;
        this.owner_image = owner_image;
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

    getTeachableImage() {
        return this.teachable_image;
    }

    getOwnerImage() {
        return this.owner_image;
    }
}

module.exports = Perk;