exports.makeErrorHandler = (invalidInput, internalError, singleResponse) => {
    return function errorHandler(error, res) {
        const errorMessage = error.message;
        if (errorMessage.startsWith(invalidInput)) {
            res.status(400).end(singleResponse(errorMessage.slice(invalidInput.length)));
        } else {
            console.dir(error, { depth: null });
            res.status(500).end(singleResponse(internalError));
        }
    };
};