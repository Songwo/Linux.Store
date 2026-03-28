import http from '@/api/http'

export interface AnnouncementItem {
  id: number
  title: string
  content: string
  link?: string
  level: string
  pinned: number
  status: number
}

export interface CategoryItem {
  id: number
  name: string
  icon?: string
}

export interface ProductItem {
  id: number
  category_id: number
  category_name: string
  default_sku_id: number
  name: string
  subtitle: string
  type: string
  cover: string
  price: number
  origin_price: number
  points_price: number
  stock: number
  status: number
  is_hot: number
  is_recommend: number
  sales_count: number
  view_count: number
  rating?: number
  review_count?: number
}

export interface ReviewItem {
  id: number
  product_id: number
  user_id: number
  nickname: string
  avatar: string
  rating: number
  content: string
  created_at: string
}

export interface ProductListResult {
  list: ProductItem[]
  total: number
  page: number
  page_size: number
}

export interface ProductDetailResult {
  product: ProductItem & {
    description: string
    gallery: string[]
    tags: string[]
    purchase_note: string
    delivery_note: string
    service_note: string
    limit_per_user: number
  }
  skus: Array<{
    id: number
    product_id: number
    sku_code: string
    title: string
    price: number
    points_price: number
    stock: number
    status: number
  }>
  seckill_info?: {
    campaign_id: number
    seckill_price: number
    campaign_name: string
    start_at: string
    end_at: string
  }
  related_products: ProductItem[]
}

export interface WalletSummary {
  balance: number
  points: number
  total_income: number
  total_expense: number
  sign_reward_total: number
  sign_days: number
}

export interface WalletFlowItem {
  type: 'balance' | 'points'
  biz_type: string
  biz_no: string
  direction: number
  amount: number
  points: number
  description: string
  created_at: string
}

export interface SignStatus {
  today_signed: boolean
  streak_days: number
  today_reward: number
  reward_balance: number
}

export interface SignHistoryItem {
  sign_date: string
  streak_days: number
  reward_points: number
  reward_balance: number
}

export interface UserCenterData {
  user: {
    id: number
    email: string
    nickname: string
    avatar?: string
    source: string
    created_at: string
  }
  wallet: {
    balance: number
    points: number
  }
  stats: {
    sign_days: number
    total_spend: number
    wishlist_count: number
  }
  recent_orders: Array<{
    order_no: string
    order_type: string
    status: number
    pay_amount: number
    created_at: string
    paid_at?: string
  }>
  recent_flows: Array<{
    type: 'balance' | 'points'
    biz_type: string
    direction: number
    amount: number
    points: number
    remark: string
    created_at: string
  }>
  oauth_bindings: Array<{
    provider: string
    provider_username: string
    created_at: string
  }>
}

export interface WishlistStatus {
  liked: boolean
}

export interface CardSecretListItem {
  id: number
  profile_id: number
  product_id: number
  sku_id: number
  order_no: string
  batch_no: string
  masked_summary: string
  status: number
  product_name: string
  sku_title: string
  sku_code: string
  profile_name: string
  product_url: string
  redeem_url: string
  guide_text: string
  privacy_note: string
  support_contact: string
  assigned_at?: string
  revealed_at?: string
  reveal_count: number
  redeemed_at?: string
  created_at?: string
}

export interface CardSecretDetailResult {
  id: number
  order_no: string
  status: number
  masked_summary: string
  product_name: string
  sku_title: string
  sku_code: string
  profile_name: string
  product_url: string
  redeem_url: string
  guide_text: string
  privacy_note: string
  support_contact: string
  revealed_at?: string
  reveal_count: number
  redeemed_at?: string
  redirect_url?: string
  secret: {
    card_code?: string
    card_password?: string
    redeem_code?: string
    extra_note?: string
  }
}

export interface SeckillItem {
  seckill_campaign_id: number
  campaign_name: string
  product_name: string
  sku_id: number
  seckill_price: number
  stock: number
  available_stock: number
  status: number
  campaign_status?: number
  start_at?: string
  end_at?: string
  progress?: number
}

export const mallApi = {
  async getAnnouncements() {
    const res = await http.get<AnnouncementItem[]>('/announcements')
    return res.data
  },
  async getCategories() {
    const res = await http.get<CategoryItem[]>('/categories')
    return res.data
  },
  async getProducts(params: Record<string, unknown>) {
    const res = await http.get<ProductListResult>('/products', { params })
    return res.data
  },
  async getProductDetail(id: number | string) {
    const res = await http.get<ProductDetailResult>(`/products/${id}`)
    return res.data
  },
  async getProductReviews(id: number | string, params?: Record<string, unknown>) {
    const res = await http.get<{ list: ReviewItem[]; total: number }>(`/products/${id}/reviews`, { params })
    return res.data
  },
  async submitProductReview(id: number | string, rating: number, content: string) {
    const res = await http.post(`/user/products/${id}/reviews`, { rating, content })
    return res.data
  },
  async createOrder(payload: Record<string, unknown>) {
    const res = await http.post<{ order_no: string; pay_amount: number; points_amount: number }>('/user/orders', payload)
    return res.data
  },
  async payOrder(orderNo: string) {
    const res = await http.post('/user/payments/balance', {
      order_no: orderNo,
      idempotent_key: crypto.randomUUID().replace(/-/g, ''),
    })
    return res.data
  },
  async getOrders(status = 'all') {
    const res = await http.get('/user/orders', { params: { status } })
    return res.data
  },
  async getOrderDetail(orderNo: string) {
    const res = await http.get(`/user/orders/${orderNo}`)
    return res.data
  },
  async cancelOrder(orderNo: string) {
    const res = await http.post(`/user/orders/${orderNo}/cancel`)
    return res.data
  },
  async getCards(orderNo?: string) {
    const res = await http.get<{ list: CardSecretListItem[] }>('/user/cards', { params: { order_no: orderNo } })
    return res.data
  },
  async revealCard(id: number | string) {
    const res = await http.post<CardSecretDetailResult>(`/user/cards/${id}/reveal`)
    return res.data
  },
  async redeemCard(id: number | string) {
    const res = await http.post<CardSecretDetailResult>(`/user/cards/${id}/redeem`)
    return res.data
  },
  async getWalletSummary() {
    const res = await http.get<WalletSummary>('/user/wallet')
    return res.data
  },
  async getWalletFlows(params: Record<string, unknown>) {
    const res = await http.get<{ list: WalletFlowItem[]; total: number; page: number; page_size: number }>('/user/wallet/flows', { params })
    return res.data
  },
  async getSignStatus() {
    const res = await http.get<SignStatus>('/user/sign/status')
    return res.data
  },
  async signIn() {
    const res = await http.post('/user/sign')
    return res.data
  },
  async getSignHistory(month?: string) {
    const res = await http.get<{ month: string; list: SignHistoryItem[] }>('/user/sign/history', { params: { month } })
    return res.data
  },
  async getUserCenter() {
    const res = await http.get<UserCenterData>('/user/center')
    return res.data
  },
  async getOauthAuthorizeUrl(provider: string) {
    const res = await http.get<{ authorize_url: string }>(`/auth/oauth/${provider}/authorize`)
    return res.data
  },
  async getWishlist() {
    const res = await http.get<ProductItem[]>('/user/wishlist')
    return res.data
  },
  async getWishlistStatus(productId: number | string) {
    const res = await http.get<WishlistStatus>(`/user/wishlist/${productId}`)
    return res.data
  },
  async setWishlist(productId: number | string, liked: boolean) {
    const res = liked ? await http.post(`/user/wishlist/${productId}`) : await http.delete(`/user/wishlist/${productId}`)
    return res.data as WishlistStatus
  },
  async getSeckillGoods() {
    const res = await http.get<SeckillItem[]>('/seckill/goods')
    return res.data
  },
  async purchaseSeckill(campaignId: number, skuId: number) {
    const res = await http.post<{ status: string; campaign_id: number; sku_id: number }>('/user/seckill/purchase', {
      campaign_id: campaignId,
      sku_id: skuId,
    })
    return res.data
  },
  async getSeckillResult(campaignId: number) {
    const res = await http.get<{ status: string }>('/user/seckill/result', { params: { campaign_id: campaignId } })
    return res.data
  },
}
