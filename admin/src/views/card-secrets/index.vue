<template>
  <section class="admin-panel page">
    <div class="toolbar">
      <div class="title-block">
        <h1>卡密中心</h1>
        <p class="page-desc">
          按 SKU 绑定卡密档案，批量导入卡密并跟踪发放、查看与兑换状态。
          当前共 {{ profiles.length }} 个档案，可发放 {{ totals.available }} 条，已发放 {{ totals.assigned }} 条，已兑换 {{ totals.redeemed }} 条。
        </p>
      </div>
      <div class="actions">
        <el-button @click="refreshAll">刷新</el-button>
        <el-button type="primary" @click="openProfileDialog()">新建档案</el-button>
        <el-button type="success" :disabled="!profiles.length" @click="openImportDialog()">批量导入</el-button>
      </div>
    </div>

    <div class="section-head">
      <div>
        <h2>卡密档案</h2>
        <p>每个 SKU 只允许绑定一个启用中的卡密档案。</p>
      </div>
    </div>
    <el-table v-loading="profilesLoading" :data="profiles" row-key="id" style="margin-top: 18px">
      <el-table-column prop="profile_name" label="档案名称" min-width="220" />
      <el-table-column label="商品 / SKU" min-width="260">
        <template #default="{ row }">
          <div class="sku-cell">
            <strong>{{ row.product_name || '-' }}</strong>
            <span>{{ row.sku_title || '-' }} / {{ row.sku_code || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="available_count" label="可发放" width="110" />
      <el-table-column prop="assigned_count" label="已发放" width="110" />
      <el-table-column prop="redeemed_count" label="已兑换" width="110" />
      <el-table-column prop="status" label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '启用' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260">
        <template #default="{ row }">
          <el-button link type="primary" @click="openProfileDialog(row)">编辑</el-button>
          <el-button link type="success" @click="openImportDialog(row)">导入卡密</el-button>
          <el-button link @click="filterByProfile(row.id)">查看明细</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="section-head section-head-gap">
      <div>
        <h2>卡密库存</h2>
        <p>后台仅展示脱敏摘要，明文卡密不会出现在管理视图和操作日志中。</p>
      </div>
      <div class="actions filter-actions">
        <el-select v-model="itemQuery.profile_id" clearable placeholder="筛选档案" style="width: 220px" @change="loadItems">
          <el-option v-for="profile in profiles" :key="profile.id" :label="profile.profile_name" :value="profile.id" />
        </el-select>
        <el-select v-model="itemQuery.status" style="width: 150px" @change="loadItems">
          <el-option label="全部状态" value="all" />
          <el-option label="可发放" value="10" />
          <el-option label="已发放" value="20" />
          <el-option label="已兑换" value="30" />
          <el-option label="已停用" value="40" />
        </el-select>
        <el-input v-model="itemQuery.keyword" placeholder="搜索订单号 / 脱敏摘要" clearable style="width: 240px" @keyup.enter="loadItems" />
        <el-button type="primary" @click="loadItems">查询</el-button>
      </div>
    </div>
    <el-table v-loading="itemsLoading" :data="items" style="margin-top: 18px">
      <el-table-column prop="masked_summary" label="脱敏摘要" min-width="260" />
      <el-table-column prop="profile_name" label="档案" min-width="160" />
      <el-table-column prop="batch_no" label="批次号" width="180" />
      <el-table-column prop="order_no" label="订单号" width="180" />
      <el-table-column prop="user_id" label="用户 ID" width="110" />
      <el-table-column prop="status" label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reveal_count" label="查看次数" width="100" />
      <el-table-column prop="assigned_at" label="发放时间" min-width="170" />
      <el-table-column prop="redeemed_at" label="兑换时间" min-width="170" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 10 || row.status === 40"
            link
            :type="row.status === 10 ? 'danger' : 'success'"
            @click="toggleItemStatus(row)"
          >
            {{ row.status === 10 ? '停用' : '启用' }}
          </el-button>
          <span v-else class="muted-text">已发放不可改</span>
        </template>
      </el-table-column>
    </el-table>
    <div class="pager">
      <el-pagination
        v-model:current-page="itemQuery.page"
        v-model:page-size="itemQuery.page_size"
        layout="total, prev, pager, next"
        :total="itemsTotal"
        @current-change="loadItems"
      />
    </div>

    <el-dialog v-model="profileDialogVisible" :title="editingProfileId ? '编辑卡密档案' : '新建卡密档案'" width="720px">
      <el-form :model="profileForm" label-width="110px">
        <el-form-item label="绑定 SKU">
          <el-select v-model="profileForm.sku_id" filterable placeholder="请选择商品 SKU" style="width: 100%">
            <el-option
              v-for="sku in skuOptions"
              :key="sku.sku_id"
              :label="`${sku.product_name} / ${sku.sku_title} / ${sku.sku_code}`"
              :value="sku.sku_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="档案名称">
          <el-input v-model="profileForm.profile_name" placeholder="例如：标准版自动发卡" />
        </el-form-item>
        <el-form-item label="商品链接">
          <el-input v-model="profileForm.product_url" placeholder="https://example.com/product" />
        </el-form-item>
        <el-form-item label="兑换链接">
          <el-input v-model="profileForm.redeem_url" placeholder="https://example.com/redeem" />
        </el-form-item>
        <el-form-item label="兑换说明">
          <el-input v-model="profileForm.guide_text" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="隐私提示">
          <el-input v-model="profileForm.privacy_note" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="客服联系方式">
          <el-input v-model="profileForm.support_contact" placeholder="邮箱 / 工单 / TG / QQ" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="profileEnabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="profileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialogVisible" title="批量导入卡密" width="760px">
      <el-form :model="importForm" label-width="110px">
        <el-form-item label="目标档案">
          <el-select v-model="importForm.profile_id" filterable placeholder="请选择档案" style="width: 100%">
            <el-option v-for="profile in profiles" :key="profile.id" :label="profile.profile_name" :value="profile.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="批次号">
          <el-input v-model="importForm.batch_no" placeholder="留空则自动生成批次号" />
        </el-form-item>
        <el-form-item label="导入格式">
          <div class="import-help">
            <p>每行一条，字段顺序为：`卡号 | 卡密 | 兑换码 | 备注`。</p>
            <p>支持只填前 1-3 项，未提供的字段留空即可，例如：`ABC123 | PASS888 | | 限时激活`。</p>
          </div>
        </el-form-item>
        <el-form-item label="卡密内容">
          <el-input v-model="importForm.lines" type="textarea" :rows="12" placeholder="CARD001 | PASS001 | CODE001 | 首批\nCARD002 | PASS002 | CODE002 | 备用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitImport">开始导入</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/api/http'

interface ProfileItem {
  id: number
  profile_name: string
  product_name: string
  sku_title: string
  sku_code: string
  status: number
  available_count: number
  assigned_count: number
  redeemed_count: number
  disabled_count: number
  guide_text: string
  privacy_note: string
  support_contact: string
  product_url: string
  redeem_url: string
  sku_id: number
}

const profilesLoading = ref(false)
const itemsLoading = ref(false)
const profiles = ref<ProfileItem[]>([])
const skuOptions = ref<any[]>([])
const items = ref<any[]>([])
const itemsTotal = ref(0)

const profileDialogVisible = ref(false)
const importDialogVisible = ref(false)
const editingProfileId = ref<number | null>(null)
const profileEnabled = ref(true)

const itemQuery = reactive({ profile_id: undefined as number | undefined, status: 'all', keyword: '', page: 1, page_size: 10 })
const profileForm = reactive({ sku_id: undefined as number | undefined, profile_name: '', product_url: '', redeem_url: '', guide_text: '', privacy_note: '', support_contact: '' })
const importForm = reactive({ profile_id: undefined as number | undefined, batch_no: '', lines: '' })

const totals = computed(() => profiles.value.reduce((acc, profile) => {
  acc.available += Number(profile.available_count || 0)
  acc.assigned += Number(profile.assigned_count || 0)
  acc.redeemed += Number(profile.redeemed_count || 0)
  return acc
}, { available: 0, assigned: 0, redeemed: 0 }))

function statusText(status: number) {
  return ({ 10: '可发放', 20: '已发放', 30: '已兑换', 40: '已停用' } as Record<number, string>)[status] || '未知'
}

function statusTagType(status: number) {
  return ({ 10: 'success', 20: 'warning', 30: 'info', 40: 'danger' } as Record<number, string>)[status] || 'info'
}

function resetProfileForm() {
  Object.assign(profileForm, { sku_id: undefined, profile_name: '', product_url: '', redeem_url: '', guide_text: '', privacy_note: '', support_contact: '' })
  profileEnabled.value = true
  editingProfileId.value = null
}

function resetImportForm() {
  Object.assign(importForm, { profile_id: itemQuery.profile_id || profiles.value[0]?.id, batch_no: '', lines: '' })
}

async function loadSkuOptions() {
  const res = await http.get('/admin/card-secret-skus')
  skuOptions.value = res.data || []
}

async function loadProfiles() {
  profilesLoading.value = true
  try {
    const res = await http.get('/admin/card-secret-profiles')
    profiles.value = res.data || []
    if (itemQuery.profile_id && !profiles.value.some((profile) => profile.id === itemQuery.profile_id)) {
      itemQuery.profile_id = undefined
    }
  } finally {
    profilesLoading.value = false
  }
}

async function loadItems() {
  itemsLoading.value = true
  try {
    const res = await http.get('/admin/card-secret-items', { params: itemQuery })
    items.value = res.data.list || []
    itemsTotal.value = Number(res.data.total || 0)
  } finally {
    itemsLoading.value = false
  }
}

async function refreshAll() {
  await Promise.all([loadProfiles(), loadItems()])
}

function openProfileDialog(profile?: any) {
  resetProfileForm()
  if (profile) {
    editingProfileId.value = profile.id
    profileForm.sku_id = profile.sku_id
    profileForm.profile_name = profile.profile_name || ''
    profileForm.product_url = profile.product_url || ''
    profileForm.redeem_url = profile.redeem_url || ''
    profileForm.guide_text = profile.guide_text || ''
    profileForm.privacy_note = profile.privacy_note || ''
    profileForm.support_contact = profile.support_contact || ''
    profileEnabled.value = profile.status === 1
  }
  profileDialogVisible.value = true
}

function openImportDialog(profile?: any) {
  resetImportForm()
  if (profile?.id) {
    importForm.profile_id = profile.id
  }
  importDialogVisible.value = true
}

function filterByProfile(profileId: number) {
  itemQuery.profile_id = profileId
  itemQuery.page = 1
  loadItems()
}

async function saveProfile() {
  if (!profileForm.sku_id) {
    ElMessage.warning('请选择绑定 SKU')
    return
  }
  const payload = { ...profileForm, status: profileEnabled.value ? 1 : 0 }
  if (editingProfileId.value) {
    await http.put(`/admin/card-secret-profiles/${editingProfileId.value}`, payload)
    ElMessage.success('卡密档案已更新')
  } else {
    await http.post('/admin/card-secret-profiles', payload)
    ElMessage.success('卡密档案已创建')
  }
  profileDialogVisible.value = false
  await refreshAll()
}

function parseImportLines() {
  const normalized = importForm.lines.replace(/｜/g, '|').trim()
  if (!normalized) {
    throw new Error('请输入要导入的卡密内容')
  }
  return normalized.split(/\r?\n/).map((rawLine, index) => {
    const line = rawLine.trim()
    if (!line) {
      return null
    }
    const parts = line.split('|').map((part) => part.trim())
    const [card_code = '', card_password = '', redeem_code = '', ...rest] = parts
    if (!card_code && !card_password && !redeem_code) {
      throw new Error(`第 ${index + 1} 行缺少卡密内容`)
    }
    return {
      card_code,
      card_password,
      redeem_code,
      extra_note: rest.join(' | '),
    }
  }).filter(Boolean)
}

async function submitImport() {
  if (!importForm.profile_id) {
    ElMessage.warning('请选择导入目标档案')
    return
  }
  const items = parseImportLines()
  await http.post('/admin/card-secret-items/import', {
    profile_id: importForm.profile_id,
    batch_no: importForm.batch_no,
    items,
  })
  ElMessage.success(`已导入 ${items.length} 条卡密`)
  importDialogVisible.value = false
  await refreshAll()
}

async function toggleItemStatus(row: any) {
  const nextStatus = row.status === 10 ? 40 : 10
  await http.put(`/admin/card-secret-items/${row.id}/status`, { status: nextStatus })
  ElMessage.success(nextStatus === 40 ? '卡密已停用' : '卡密已启用')
  await refreshAll()
}

onMounted(async () => {
  await Promise.all([loadSkuOptions(), loadProfiles(), loadItems()])
})
</script>

<style scoped>
.page { padding: 24px; }
.toolbar,
.section-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.toolbar { margin-bottom: 28px; }
.toolbar h1 { margin: 0; font-size: 26px; }
.title-block { max-width: 760px; }
.page-desc,
.section-head p { margin: 8px 0 0; color: var(--admin-text-secondary); font-size: 13px; line-height: 1.6; }
.section-head h2 { font-size: 18px; }
.section-head-gap { margin-top: 28px; padding-top: 28px; border-top: 1px solid var(--admin-border); }
.actions,
.filter-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.filter-actions { justify-content: flex-end; }
.sku-cell { display: grid; gap: 4px; }
.sku-cell span { color: var(--admin-text-secondary); font-size: 12px; }
.import-help { color: var(--admin-text-secondary); line-height: 1.7; }
.import-help p { margin: 0; }
.pager { display: flex; justify-content: flex-end; margin-top: 18px; }
.muted-text { color: var(--admin-text-muted); font-size: 12px; }
@media (max-width: 768px) {
  .toolbar,
  .section-head { flex-direction: column; }
  .actions,
  .filter-actions { width: 100%; justify-content: flex-start; }
}
</style>
