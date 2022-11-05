const { productsDb, ordersDb, affiliatesDb } = require("../database");
const { Analytics, Order } = require("../entities");

async function fetchCounts() {
    // @ts-ignore
    const counts = new Analytics.Counts({});
    counts.totalProducts = await productsDb.count({});
    counts.totalOrders = await ordersDb.count();
    counts.acceptedOrders = await ordersDb.count({ status: Order.statuses.Accepted });
    counts.totalAffiliates = await affiliatesDb.count();
    counts.totalEarned = await affiliatesDb.getSum({}, "wallet.totalMade");
    counts.totalUnpaid = await affiliatesDb.getSum({}, "wallet.currentBalance");
    return counts.toJson();
}

module.exports = {
    getCounts: async () => {
        const counts = await fetchCounts();
        return new Analytics({ counts }).toJson();
    }
};