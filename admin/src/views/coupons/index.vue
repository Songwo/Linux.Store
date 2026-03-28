<template>
  <section class="admin-panel page">
    <div class="toolbar">
      <h1>优惠券管理</h1>
      <el-button type="primary" @click="handleAdd">新建模板</el-button>
    </div>
    <el-table v-loading="loading" :data="rows" style="margin-top: 18px;">
      <el-table-column prop="name" label="模板名称" min-width="200" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="{ row }">
          <el-tag>{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="面额" width="100" />
      <el-table-column prop="threshold_amount" label="门槛" width="100" />
      <el-table-column prop="issued" label="已发放" width="100" />
      <el-table-column prop="total" label="总量" width="100" />
      <el-table-column label="有效时间" min-width="280">
        <template #default="{ row }">{{ row.start_at }} - {{ row.end_at }}</template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="新建优惠券模板" width="50%" min-width="500px" append-to-body>
      <el-form :model="form" label-width="110px" style="padding: 10px 20px">
        <el-form-item label="模板名称"><el-input v-model="form.name" placeholder="请输入模板名称" /></el-form-item>
        <el-form-item label="优惠券类型">
          <el-select v-model="form.type" style="width: 100%;">
            <el-option label="满减券" value="discount" />
            <el-option label="兑换券" value="points" />
          </el-select>
        </el-form-item>
        <el-form-item label="总量"><el-input-number v-model="form.total" :min="1" style="width:100%" /></el-form-item>
        <el-form-item label="面额"><el-input-number v-model="form.amount" :min="0" :precision="2" style="width:100%" /></el-form-item>
        <el-form-item label="门槛"><el-input-number v-model="form.threshold_amount" :min="0" :precision="2" style="width:100%" /></el-form-item>
        <el-form-item label="积分成本"><el-input-number v-model="form.points_cost" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="有效时间">
           <el-date-picker
            v-model="form.range"
            type="datetimerange"
            range-separator="To"
            start-placeholder="Start"
            end-placeholder="End"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" placeholder="优惠券详细说明" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createTemplate">提交创建</el-button>
      </template>
    </el-dialog>
  </section>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/api/http'

const loading = ref(false)
const rows = ref<any[]>([])
const dialogVisible = ref(false)
const form = reactive({
  name: '',
  type: 'discount',
  total: 500,
  amount: 20,
  threshold_amount: 99,
  points_cost: 0,
  range: ['2026-03-20 00:00:00', '2026-12-31 23:59:59'] as string[],
  description: '',
})

async function loadTemplates() {
  loading.value = true
  try {
    const res = await http.get('/admin/coupon/templates')
    rows.value = res.data
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  dialogVisible.value = true
}

async function createTemplate() {
  if (!form.name || form.range.length < 2) return ElMessage.warning('请填写完整信息')
  
  const payload = {
    ...form,
    start_at: form.range[0],
    end_at: form.range[1],
  }
  delete (payload as any).range

  await http.post('/admin/coupon/templates', payload)
  ElMessage.success('优惠券模板创建成功')
  dialogVisible.value = false
  await loadTemplates()
}

onMounted(loadTemplates)
</script>
<style scoped>
.page { padding: 24px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; }
</style>
