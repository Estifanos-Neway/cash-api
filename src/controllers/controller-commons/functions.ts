function singleResponse(response: string): string {
    return JSON.stringify({ message: response });
}

export {
    singleResponse
};