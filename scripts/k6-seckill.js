import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<500'],
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost'
const TOKEN = __ENV.TOKEN || ''

export default function () {
  const payload = JSON.stringify({ campaign_id: 1, sku_id: 2 })
  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
  }
  const res = http.post(`${BASE_URL}/api/v1/user/seckill/purchase`, payload, params)
  check(res, {
    'status is 200 or 400': (r) => r.status === 200 || r.status === 400,
  })
  sleep(1)
}
