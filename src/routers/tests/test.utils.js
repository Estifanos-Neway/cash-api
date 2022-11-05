
module.exports = {
    setJestTimeout: (seconds = 60) => {
        jest.setTimeout(seconds * 1000);
    }
};