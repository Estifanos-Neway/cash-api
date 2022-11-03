
module.exports = {
    setJestTimeout: (seconds = 40) => {
        jest.setTimeout(seconds * 1000);
    }
};