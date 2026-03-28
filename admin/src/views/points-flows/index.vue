<template>
  <section class="admin-panel page">
    <div class="toolbar">
      <h1>积分流水</h1>
      <div class="actions">
        <el-input v-model="userId" placeholder="按用户 ID 过滤" style="width: 220px;" clearable @keyup.enter="loadRows" />
        <el-button type="primary" @click="loadRows">查询</el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="rows">
      <el-table-column prop="id" label="ID" width="90" />
      <el-table-column prop="user_id" label="用户ID" width="100" />
      <el-table-column prop="nickname" label="用户" width="160" />
      <el-table-column prop="biz_type" label="业务类型" width="140" />
      <el-table-column prop="biz_no" label="业务单号" min-width="180" />
      <el-table-column prop="direction" label="方向" width="100">
        <template #default="{ row }">
          <el-tag :type="row.direction === 1 ? 'success' : 'warning'">{{ row.direction === 1 ? '增加' : '扣减' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="points" label="积分" width="120" />
      <el-table-column prop="points_after" label="变更后积分" width="140" />
      <el-table-column prop="remark" label="备注" min-width="180" />
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
const userId = ref('')

async function loadRows() {
  loading.value = true
  try {
    const res = await http.get('/admin/points-flows', { params: { user_id: userId.value, page: page.value, page_size: pageSize.value } })
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
