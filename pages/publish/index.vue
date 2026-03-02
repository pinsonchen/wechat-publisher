<template>
  <div class="publish-page">
    <div class="header">
      <h1>发布管理</h1>
      <UButton to="/draft" color="white" variant="ghost">
        返回草稿箱
      </UButton>
    </div>

    <!-- 已发布列表 -->
    <UCard>
      <template #header>
        <h2>已发布文章</h2>
      </template>

      <div v-if="loading" class="loading">
        <UProgress animation="bounce" />
        <p>加载中...</p>
      </div>

      <div v-else-if="publishedList.length > 0" class="publish-list">
        <div v-for="item in publishedList" :key="item.publish_id" class="publish-item">
          <div class="item-info">
            <h3>{{ item.title }}</h3>
            <p class="item-meta">
              <span>发布时间：{{ formatTime(item.publish_time) }}</span>
              <span>状态：{{ getStatusText(item.status) }}</span>
            </p>
          </div>
          <div class="item-actions">
            <UButton
              color="white"
              variant="outline"
              icon="i-heroicons-link"
              :href="item.article_url"
              target="_blank"
            >
              查看文章
            </UButton>
            <UButton
              color="primary"
              variant="ghost"
              icon="i-heroicons-chart-bar"
              @click="checkStatus(item.publish_id)"
            >
              刷新状态
            </UButton>
          </div>
        </div>
      </div>

      <div v-else class="empty">
        <UIcon name="i-heroicons-paper-airplane" class="empty-icon" />
        <p>暂无发布记录</p>
        <UButton to="/draft" color="primary">
          去草稿箱发布文章
        </UButton>
      </div>
    </UCard>

    <!-- 发布统计 -->
    <UCard class="stats-card">
      <template #header>
        <h2>发布统计</h2>
      </template>
      <div class="stats">
        <div class="stat-item">
          <div class="stat-label">本月已发布</div>
          <div class="stat-value">{{ monthCount }} 篇</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">剩余次数</div>
          <div class="stat-value">{{ remainingCount }} 次</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">下次可发布</div>
          <div class="stat-value">{{ nextPublishTime }}</div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
interface PublishedItem {
  publish_id: number;
  title: string;
  author: string;
  publish_time: number;
  article_url: string;
  status: string;
}

const loading = ref(true);
const publishedList = ref<PublishedItem[]>([]);
const monthCount = ref(0);
const remainingCount = ref(3); // 订阅号每天 1 次，服务号每月 4 次
const nextPublishTime = ref('明天 00:00');

// 加载发布列表
async function loadPublishedList() {
  loading.value = true;
  
  try {
    // TODO: 实现获取发布列表 API
    // const resp = await fetch('/api/web/publish/list');
    // const data = await resp.json();
    
    // 模拟数据
    publishedList.value = [];
  } catch (error) {
    console.error('加载发布列表失败:', error);
    alert('加载失败，请稍后重试');
  } finally {
    loading.value = false;
  }
}

// 检查发布状态
async function checkStatus(publishId: number) {
  try {
    const resp = await fetch('/api/web/publish/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publish_id: publishId,
      }),
    });

    const result = await resp.json();
    if (result.base_resp?.ret === 0) {
      alert('状态：' + (result.msg_status || '未知'));
    } else {
      alert('查询失败：' + (result.base_resp?.err_msg || '未知错误'));
    }
  } catch (error) {
    console.error('查询状态失败:', error);
    alert('查询失败，请稍后重试');
  }
}

// 格式化时间
function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN');
}

// 获取状态文本
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'send_success': '发送成功',
    'send_fail': '发送失败',
    'timing_send': '定时发送中',
    'wait_send': '等待发送',
  };
  return statusMap[status] || status;
}

onMounted(() => {
  loadPublishedList();
});
</script>

<style scoped>
.publish-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.loading p {
  margin-top: 10px;
  color: #666;
}

.publish-list {
  display: grid;
  gap: 16px;
}

.publish-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.publish-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.item-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.item-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.empty {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #ccc;
  margin-bottom: 20px;
}

.empty p {
  color: #999;
  margin-bottom: 20px;
}

.stats-card {
  margin-top: 30px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #07c160;
}

@media (max-width: 768px) {
  .publish-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .item-actions {
    width: 100%;
  }

  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
