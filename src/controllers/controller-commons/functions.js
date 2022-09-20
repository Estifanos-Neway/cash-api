function singleResponse(response) {
    return JSON.stringify({ message: response });
}

module.exports = {
    singleResponse
};