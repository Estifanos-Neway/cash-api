/* eslint-disable indent */
const mainWebUrl = "http://localhost:3000";
const adminWebUrl = "http://localhost:4000";
module.exports = {
  defaultAdmin: {
    username: "Admin",
    password: "password"
  },
  defaultCommissionRate: 10,
  urls: {
    baseUrl: mainWebUrl,
    passwordRecoveryPath: "/recovery_password"
  },
  defaultCountryForPhone: "ETH",
  corsWhiteList: [mainWebUrl, adminWebUrl],
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
