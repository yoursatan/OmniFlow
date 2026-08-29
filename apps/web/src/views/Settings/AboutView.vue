<template>
  <div class="omni-card">
    <h2>关于汇流 OmniFlow</h2>
    <p class="omni-muted">
      一款 Web + PC 双端同构的全源媒体聚合规则引擎。开源（仓库地址见页脚），空壳发行，规则由用户自行导入或在规则工坊中编写。
    </p>
    <el-descriptions :column="1" border style="margin-top: 16px; max-width: 720px;">
      <el-descriptions-item label="版本">v0.1.0 (M0 空壳阶段)</el-descriptions-item>
      <el-descriptions-item label="协议">待选择（推荐 AGPL-3.0）</el-descriptions-item>
      <el-descriptions-item label="仓库">
        <a href="https://github.com/yoursatan/OmniFlow" target="_blank" rel="noreferrer noopener">github.com/yoursatan/OmniFlow</a>
      </el-descriptions-item>
      <el-descriptions-item label="支持的源范式">
        Legado 书源 / JS (Hiker/DrPy/ESO) / TVBox + CMS / ZyPlayer 一键 / IPTV + XMLTV / RSS
      </el-descriptions-item>
      <el-descriptions-item label="设计理念">
        双端同构核心（纯 TS）+ JS 安全沙箱（QuickJS） + 规则工坊（段-步 v2 可视化调试）
      </el-descriptions-item>
      <el-descriptions-item label="鸣谢">
        Legado / TVBox / HikerView / 阅视 / DrPy / ZyPlayer 等开源先驱项目
      </el-descriptions-item>
    </el-descriptions>
    <div style="margin-top: 20px;" class="omni-muted">
      ⚠️ 本软件不含任何内置源或解析地址，解析地址与源文件均由用户自行导入。使用时请遵守所在国家 / 地区的版权法律法规。
    </div>
  </div>
</template>
