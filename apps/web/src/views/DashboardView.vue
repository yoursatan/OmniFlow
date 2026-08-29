<template>
  <div class="hero">
    <div class="in">
      <h2>汇流 OmniFlow</h2>
      <p>一套规则引擎 · 兼容 Legado 书源 / TVBox / 海阔视界 / ESO / DRPy / CMS / IPTV</p>
      <div class="hstats">
        <div class="hstat"><b>87</b><i>已启用源</i></div>
        <div class="hstat"><b>11</b><i>格式适配器</i></div>
        <div class="hstat"><b>96.4%</b><i>源健康度</i></div>
        <div class="hstat"><b>v0.1.0</b><i>当前版本</i></div>
      </div>
    </div>
  </div>

  <div class="mini-stats">
    <div class="card mstat"><b style="color:var(--cy)">23</b><span>影视源</span><span class="trend"
        style="color:var(--green)">↗ 本周新增 2</span></div>
    <div class="card mstat"><b style="color:var(--acc)">41</b><span>书源 / 漫画源</span><span class="trend"
        style="color:var(--muted)">体检 39 个正常</span></div>
    <div class="card mstat"><b style="color:var(--gold)">9</b><span>直播源 · 2,468 频道</span><span class="trend"
        style="color:var(--muted)">EPG 已关联 6 源</span></div>
    <div class="card mstat"><b style="color:var(--orange)">14</b><span>解析接口</span><span class="trend"
        style="color:var(--red)">2 个失效待处理</span></div>
  </div>

  <div class="sec-head">
    <h2>▶ 继续观看</h2><span class="sub">换源不换进度</span><span class="more" @click="$router.push('/video-lib')">查看全部 ›</span>
  </div>
  <div class="card" style="margin-bottom:24px">
    <div class="continue-card" @click="$router.push('/player/1')">
      <div class="thumb p5">
        <div class="prog" style="width:62%"></div>
      </div>
      <div class="info"><b>漫长的季节</b><span>08:36 / 42:10 · 量子资源 · 2 小时前</span>
        <div class="bar"><i style="width:62%"></i></div>
      </div>
    </div>
    <div class="continue-card" @click="$router.push('/player/1')">
      <div class="thumb p3">
        <div class="prog" style="width:28%"></div>
      </div>
      <div class="info"><b>流浪地球 2</b><span>34:12 / 2:53:00 · 量子资源 · 昨日</span>
        <div class="bar"><i style="width:22%"></i></div>
      </div>
    </div>
    <div class="continue-card" @click="$router.push('/player/1')">
      <div class="thumb p7">
        <div class="prog" style="width:81%"></div>
      </div>
      <div class="info"><b>三体 · 动画版</b><span>29:01 / 36:44 · 非凡CMS · 3 天前</span>
        <div class="bar"><i style="width:81%"></i></div>
      </div>
    </div>
  </div>

  <div class="sec-head">
    <h2>📚 继续阅读</h2><span class="sub">书架同步 · 含漫画</span><span class="more" @click="$router.push('/bookshelf')">书架 ›</span>
  </div>
  <div class="grid cols6">
    <div>
      <div class="poster p1" @click="$router.push('/reader/1')">
        <div class="ph">
          <div class="t">诡秘之主</div>
          <div class="s">第 892 章</div>
        </div>
      </div>
    </div>
    <div>
      <div class="poster p4" @click="$router.push('/reader/1')">
        <div class="ph">
          <div class="t">大奉打更人</div>
          <div class="s">第 1,203 章</div>
        </div>
      </div>
    </div>
    <div>
      <div class="poster p6" @click="$router.push('/reader/1')">
        <div class="ph">
          <div class="t">深海余烬</div>
          <div class="s">第 47 章</div>
        </div>
      </div>
    </div>
    <div>
      <div class="poster p3" @click="$router.push('/comic/1')">
        <div class="ph">
          <div class="t">电锯人</div>
          <div class="s">漫画 · 第 148 话</div>
        </div>
      </div>
    </div>
    <div>
      <div class="poster p2" @click="$router.push('/reader/1')">
        <div class="ph">
          <div class="t">灵境行者</div>
          <div class="s">第 217 章</div>
        </div>
      </div>
    </div>
    <div>
      <div class="poster p5" @click="$router.push('/reader/1')">
        <div class="ph">
          <div class="t">隐秘死角</div>
          <div class="s">第 55 章</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO(M3/M4): 从 Pinia globalState 读取进度 + @omniflow/core repo 聚合健康度
</script>

<style scoped>
.hero {
  border-radius: 16px; overflow: hidden; position: relative; height: 200px;
  background: linear-gradient(120deg, #1b2244, #0e1120 70%);
  display: flex; align-items: center; padding: 0 34px; margin-bottom: 22px;
  border: 1px solid var(--line);
}
.hero::after {
  content: ''; position: absolute; right: -60px; top: -60px; width: 300px; height: 300px;
  border-radius: 50%; background: radial-gradient(circle, rgba(108, 124, 255, .28), transparent 65%);
}
.hero::before {
  content: ''; position: absolute; right: 80px; bottom: -80px; width: 220px; height: 220px;
  border-radius: 50%; background: radial-gradient(circle, rgba(34, 211, 238, .16), transparent 65%);
}
.hero .in { position: relative; z-index: 1; }
.hero h2 { font-size: 24px; font-weight: 800; letter-spacing: 1px; }
.hero p { color: var(--muted); margin-top: 8px; font-size: 13px; }
.hstats { display: flex; gap: 26px; margin-top: 18px; }
.hstat b { font-size: 20px; font-family: var(--mono); color: var(--cy); display: block; }
.hstat i { font-style: normal; font-size: 11px; color: var(--muted); }
.mini-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 22px; }
.mstat { padding: 16px; display: flex; flex-direction: column; gap: 6px; }
.mstat b { font-size: 22px; font-family: var(--mono); }
.mstat span { font-size: 12px; color: var(--muted); }
.mstat .trend { font-size: 11px; }
.continue-card {
  display: flex; gap: 14px; padding: 12px; cursor: pointer;
  transition: background .18s; align-items: center;
}
.continue-card:hover { background: var(--bg3); }
.continue-card .thumb { width: 98px; height: 56px; border-radius: 8px; flex-shrink: 0; position: relative; overflow: hidden; }
.continue-card .prog { position: absolute; left: 0; bottom: 0; height: 3px; background: var(--cy); }
.continue-card .info { flex: 1; min-width: 0; }
.continue-card .info b { font-size: 13px; display: block; }
.continue-card .info span { font-size: 11px; color: var(--muted); }
.bar { height: 4px; border-radius: 2px; background: var(--bg4); margin-top: 6px; overflow: hidden; }
.bar i { display: block; height: 100%; background: linear-gradient(90deg, var(--acc), var(--cy)); }
</style>
