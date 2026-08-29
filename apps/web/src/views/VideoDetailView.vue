<template>
  <div class="omni-card detail">
    <el-row :gutter="20">
      <el-col :span="6">
        <div class="poster">🎬</div>
      </el-col>
      <el-col :span="18">
        <h2 style="margin-top: 0;">影片详情 · 屏 #12</h2>
        <p class="omni-muted" style="margin-bottom: 14px;">
          原型参数：<code>/video/{{ id }}</code> &nbsp; 海报 / 简介 / 选集 / 多源线路 tab / 解析接口切换 / 换源抽屉
        </p>
        <div style="margin-bottom: 10px;">
          <span class="omni-chip">剧情</span>
          <span class="omni-chip">科幻</span>
          <span class="omni-chip">2026</span>
          <span class="omni-chip">24 集全</span>
        </div>
        <p style="line-height: 1.8;">
          这是一个精彩的示例影片简介。某年某月，主角踏上旅程……<br />
          <span class="omni-muted">（M4 接入真实源之后，此处拉取详情段 RulePipeline 的输出）</span>
        </p>
        <div style="margin-top: 16px;">
          <el-button type="primary" size="large" :icon="VideoPlay" @click="$router.push(`/player/${id}`)">
            ▶ 立即播放
          </el-button>
          <el-button size="large" :icon="Star">收藏</el-button>
          <el-button size="large" :icon="Share">分享</el-button>
        </div>

        <h3 style="margin-top: 28px;">线路 <el-tag size="small" effect="dark" style="margin-left:6px;">共 4 条</el-tag></h3>
        <el-tabs v-model="line">
          <el-tab-pane label="线路 ① CMS" name="a">
            <div class="ep-list">
              <el-tag
                v-for="n in 24"
                :key="n"
                size="default"
                :effect="n <= 7 ? 'dark' : 'plain'"
                :type="n <= 7 ? 'primary' : 'info'"
                class="ep"
                @click="$router.push(`/player/${id}`)"
              >{{ n.toString().padStart(2, '0') }}</el-tag>
            </div>
          </el-tab-pane>
          <el-tab-pane label="线路 ② 解析池" name="b"><p class="omni-muted">解析接口 ×6，M4 实现自动切换</p></el-tab-pane>
          <el-tab-pane label="线路 ③ 备用" name="c"><p class="omni-muted">低画质 720P 备用</p></el-tab-pane>
          <el-tab-pane label="线路 ④ 4K 专线" name="d"><p class="omni-muted">（需手动导入配置）</p></el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VideoPlay, Star, Share } from '@element-plus/icons-vue';
const props = defineProps<{ id: string }>();
const line = ref('a');
// TODO(M4): 从 core.aggregate.detail(props.id) 取详情 + 多线路，聚合换源
</script>

<style scoped>
.poster {
  aspect-ratio: 2 / 3;
  border-radius: var(--radius);
  background: linear-gradient(135deg, var(--brand-soft), var(--bg-3));
  display: flex; align-items: center; justify-content: center; font-size: 90px;
  border: 1px solid var(--border);
}
.ep-list { display: flex; flex-wrap: wrap; gap: 10px; }
.ep { cursor: pointer; min-width: 46px; text-align: center; }
</style>
