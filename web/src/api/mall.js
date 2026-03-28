import http from '@/api/http';
export const mallApi = {
    async getAnnouncements() {
        const res = await http.get('/announcements');
        return res.data;
    },
    async getCategories() {
        const res = await http.get('/categories');
        return res.data;
    },
    async getProducts(params) {
        const res = await http.get('/products', { params });
        return res.data;
    },
    async getProductDetail(id) {
        const res = await http.get(`/products/${id}`);
        return res.data;
    },
    async getProductReviews(id, params) {
        const res = await http.get(`/products/${id}/reviews`, { params });
        return res.data;
    },
    async submitProductReview(id, rating, content) {
        const res = await http.post(`/user/products/${id}/reviews`, { rating, content });
        return res.data;
    },
    async createOrder(payload) {
        const res = await http.post('/user/orders', payload);
        return res.data;
    },
    async payOrder(orderNo) {
        const res = await http.post('/user/payments/balance', {
            order_no: orderNo,
            idempotent_key: crypto.randomUUID().replace(/-/g, ''),
        });
        return res.data;
    },
    async getOrders(status = 'all') {
        const res = await http.get('/user/orders', { params: { status } });
        return res.data;
    },
    async getOrderDetail(orderNo) {
        const res = await http.get(`/user/orders/${orderNo}`);
        return res.data;
    },
    async cancelOrder(orderNo) {
        const res = await http.post(`/user/orders/${orderNo}/cancel`);
        return res.data;
    },
    async getCards(orderNo) {
        const res = await http.get('/user/cards', { params: { order_no: orderNo } });
        return res.data;
    },
    async revealCard(id) {
        const res = await http.post(`/user/cards/${id}/reveal`);
        return res.data;
    },
    async redeemCard(id) {
        const res = await http.post(`/user/cards/${id}/redeem`);
        return res.data;
    },
    async getWalletSummary() {
        const res = await http.get('/user/wallet');
        return res.data;
    },
    async getWalletFlows(params) {
        const res = await http.get('/user/wallet/flows', { params });
        return res.data;
    },
    async getSignStatus() {
        const res = await http.get('/user/sign/status');
        return res.data;
    },
    async signIn() {
        const res = await http.post('/user/sign');
        return res.data;
    },
    async getSignHistory(month) {
        const res = await http.get('/user/sign/history', { params: { month } });
        return res.data;
    },
    async getUserCenter() {
        const res = await http.get('/user/center');
        return res.data;
    },
    async getOauthAuthorizeUrl(provider) {
        const res = await http.get(`/auth/oauth/${provider}/authorize`);
        return res.data;
    },
    async getWishlist() {
        const res = await http.get('/user/wishlist');
        return res.data;
    },
    async getWishlistStatus(productId) {
        const res = await http.get(`/user/wishlist/${productId}`);
        return res.data;
    },
    async setWishlist(productId, liked) {
        const res = liked ? await http.post(`/user/wishlist/${productId}`) : await http.delete(`/user/wishlist/${productId}`);
        return res.data;
    },
    async getSeckillGoods() {
        const res = await http.get('/seckill/goods');
        return res.data;
    },
    async purchaseSeckill(campaignId, skuId) {
        const res = await http.post('/user/seckill/purchase', {
            campaign_id: campaignId,
            sku_id: skuId,
        });
        return res.data;
    },
    async getSeckillResult(campaignId) {
        const res = await http.get('/user/seckill/result', { params: { campaign_id: campaignId } });
        return res.data;
    },
};
//# sourceMappingURL=mall.js.map