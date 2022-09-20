exports.makeSignInAdminCont = (jwt, env, signInAdminRepo, addJwtRefreshRepo, errorHandler, singleResponse, createAccessToken, notFound) => {
    return async (req, res) => {
        try {
            const { username, passwordHash } = req.body;
            const signedInAdmin = await signInAdminRepo(username, passwordHash);
            if (signedInAdmin) {
                const tokenData = { userId: signedInAdmin.username, userType: "admin" };
                // @ts-ignore
                const accessToken = createAccessToken(tokenData);
                // @ts-ignore
                const refreshToken = jwt.sign(tokenData, env.JWT_REFRESH_SECRETE);
                await addJwtRefreshRepo(refreshToken);
                const response = {
                    admin: signedInAdmin,
                    accessToken,
                    refreshToken
                };
                res.end(JSON.stringify(response));
            } else {
                res.status(404).end(singleResponse(notFound));
            }
        } catch (error) {
            errorHandler(error, res);
        }

    };
};