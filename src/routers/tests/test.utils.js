
module.exports = {
    setJestTimeout: (seconds = 10) => {
        jest.setTimeout(seconds * 1000);
    }
};