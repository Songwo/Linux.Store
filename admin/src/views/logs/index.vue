<template>
  <section class="admin-panel page">
    <div class="toolbar">
      <h1>操作日志</h1>
      <div class="actions">
        <el-input v-model="moduleName" placeholder="按模块过滤，如 coupon / product" style="width: 260px;" clearable @keyup.enter="loadRows" />
        <el-button type="primary" @click="loadRows">查询</el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="rows">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="operator_type" label="操作者类型" width="120" />
      <el-table-column prop="module" label="模块" width="120" />
      <el-table-column prop="action" label="动作" width="160" />
      <el-table-column prop="method" label="方法" width="100" />
      <el-table-column prop="path" label="路径" min-width="220" />
      <el-table-column prop="ip" label="IP" width="140" />
      <el-table-column prop="created_at" label="时间" min-width="180" />
    </el-table>
    <div class="pager">
      <el-pagination v-model:current-page="page" v-model:page-size="pageSize" layout="total, prev, pager, next" :total="total" @current-change="loadRows" />
    </div>
  </section>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import http from '@/api/http'

const loading = ref(false)
const rows = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const moduleName = ref('')

async function loadRows() {
  loading.value = true
  try {
    const res = await http.get('/admin/operation-logs', { params: { module: moduleName.value, page: page.value, page_size: pageSize.value } })
    rows.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

onMounted(loadRows)
</script>
<style scoped>
.page { padding: 24px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 18px; }
.actions { display: flex; gap: 12px; }
.pager { display: flex; justify-content: flex-end; margin-top: 18px; }
</style>
