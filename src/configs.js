/* eslint-disable indent */
const mainWebUrl = "cashmart.netlify.app";
const stagingMainWebUrl = "staging--" + mainWebUrl;
const adminWebUrl = "admin-" + mainWebUrl;
const stagingAdminWebUrl = "staging--" + adminWebUrl;
module.exports = {
  defaultAdmin: {
    username: "Admin",
    password: "password"
  },
  defaultCommissionRate: 10,
  urls: {
    baseUrl: mainWebUrl,
    passwordRecoveryPath: "/password-recovery",
    emailVerificationPath: "/verify-email"
  },
  defaultCountryForPhone: "ETH",
  corsWhiteList: [mainWebUrl, adminWebUrl, stagingMainWebUrl, stagingAdminWebUrl],
  affiliatesWallet: {
    initialBalance: 100,
    canWithdrawAfter: 200
  }, signingUpCredits: {
    maxNumberOfParentsToBeCredited: 3,
    initialCreditAmount: 0.04,
    creditDivider: 2
  }, productSellCredits: {
    creditSubtractionPercent: 0.5,
    minCredit: 100
  },
  contactUsEmailTo: "cashmart.et@gmail.com"
};
