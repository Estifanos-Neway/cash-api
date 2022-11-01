
module.exports = {
    setJestTimeout: (seconds = 20) => {
        jest.setTimeout(seconds * 1000);
    }
};