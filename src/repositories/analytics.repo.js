const { productsDb, ordersDb, affiliatesDb,deletedAffiliatesDb } = require("../database");
const { Analytics, Order } = require("../entities");

async function fetchCounts() {
    // @ts-ignore
    const counts = new Analytics.Counts({});
    counts.totalProducts = await productsDb.count({});
    counts.totalOrders = await ordersDb.count();
    counts.acceptedOrders = await ordersDb.count({ status: Order.statuses.Accepted });
    counts.totalAffiliates = await affiliatesDb.count();
    counts.totalUnpaid = await affiliatesDb.getSum({}, "wallet.currentBalance");
    const existingAffiliatesTotalEarned = await affiliatesDb.getSum({}, "wallet.totalMade");
    const deletedAffiliatesTotalEarned = await deletedAffiliatesDb.getSum({}, "affiliate.wallet.totalMade");
    const deletedAffiliatesTotalUnpaid = await deletedAffiliatesDb.getSum({}, "affiliate.wallet.currentBalance");
    counts.totalEarned = (existingAffiliatesTotalEarned + deletedAffiliatesTotalEarned) - deletedAffiliatesTotalUnpaid;
    // counts.totalEarned = existingAffiliatesTotalEarned;
    return counts.toJson();
}

module.exports = {
    getCounts: async () => {
        const counts = await fetchCounts();
        return new Analytics({ counts }).toJson();
    }
};