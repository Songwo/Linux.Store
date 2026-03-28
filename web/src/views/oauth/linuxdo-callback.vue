<template>
  <section class="callback-shell">
    <div class="callback-card glass-card">
      <div class="badge-chip">Linux.do OAuth2</div>
      <h1>正在完成登录</h1>
      <p v-if="loading">正在交换授权码并同步本地账号信息，请稍候。</p>
      <p v-else-if="errorMessage">{{ errorMessage }}</p>
      <p v-else>登录成功，正在跳转首页。</p>
      <div class="actions">
        <el-button v-if="errorMessage" type="primary" round @click="router.push('/login')">返回登录页</el-button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '@/api/http'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const loading = ref(true)
const errorMessage = ref('')

async function completeLogin() {
  const code = String(route.query.code || '')
  const oauthError = String(route.query.error || '')
  if (oauthError) {
    errorMessage.value = `Linux.do 授权失败: ${oauthError}`
    loading.value = false
    return
  }
  if (!code) {
    errorMessage.value = '缺少 OAuth 授权码，无法完成登录。'
    loading.value = false
    return
  }
  try {
    const res = await http.get('/auth/oauth/linux-do/callback', { params: { code } })
    auth.setToken(res.data.token)
    await auth.fetchProfile()
    await router.replace('/')
  } catch (error: any) {
    errorMessage.value = error?.message || 'Linux.do 登录失败，请重试。'
  } finally {
    loading.value = false
  }
}

onMounted(completeLogin)
</script>

<style scoped>
.callback-shell { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
.callback-card { width: min(520px, 100%); padding: 36px; display: grid; gap: 18px; }
.callback-card h1 { margin: 0; font-size: 36px; }
.callback-card p { margin: 0; color: #64748b; line-height: 1.8; }
.actions { margin-top: 6px; }
</style>
