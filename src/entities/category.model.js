module.exports = class {
    name;

    constructor({ name }) {
        this.name = name;
    }
    
    toJson() {
        return {
            name: this.name
        };
    }
};