
const defaultPort = 5000;
const verificationTokenExpiresIn = 5;
const accessTokenExpiresIn = 10;
const numberOfMaxApiRequestsPerMin = 20;

const imagesUrlPath = "/images";
const defaultProductImageUrl = `${imagesUrlPath}/products/default`;

module.exports = {
    defaultPort,
    verificationTokenExpiresIn,
    accessTokenExpiresIn,
    numberOfMaxApiRequestsPerMin,
    imagesUrlPath,
    defaultProductImageUrl
};