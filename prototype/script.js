
/* =========================================================
   汇流 OmniFlow · 交互原型 v3.0
   15 屏：11 导航页 + 4 子视图（详情 / 播放 / 阅读 / 漫画）
   ========================================================= */

/* ============ 路由 ============ */
var TITLES={
  home:['首页','总览 · 继续观看/阅读 · 源健康度'],
  search:['搜索','跨源聚合 · 分类筛选 · 相似归并'],
  bookshelf:['书架','书库分组 · 阅读进度 · 加入书库'],
  video:['影视','收藏 / 历史 · 分组归类 · 换源续播'],
  bookhall:['书院','书源发现 · 分类标签 · 直达阅读'],
  cinema:['影院','影视源发现 · 分类标签 · 直达播放'],
  rss:['RSS','订阅源发现 · 分类标签 · 资讯阅读'],
  live:['直播','IPTV · m3u 解析 · EPG 节目单'],
  studio:['规则工坊','编辑器 + 分步调试器'],
  sources:['源管理','87 源 · 分类筛选 · 分组'],
  settings:['设置','外观 · 网络 · 沙箱 · 备份'],
  detail:['影片详情','CMS 站点 · 量子资源'],
  player:['播放','ArtPlayer · HLS 嗅探 · 换源'],
  reader:['阅读','排版引擎 · legado 书源'],
  comic:['漫画','双页 / 单页 / 条漫 · legado 漫画源']
};
var SUBVIEWS={detail:1,player:1,reader:1,comic:1,studio:1};
var backStack=[];

function currentScreen(){return document.querySelector('.screen.on').id.replace('sc-','')}

function go(s){
  if(SUBVIEWS[s]&&!SUBVIEWS[currentScreen()]){
    var from=document.querySelector('.nav-item.on');
    backStack.push(from?from.dataset.s:'home');
  }
  document.querySelectorAll('.nav-item').forEach(function(n){n.classList.toggle('on',n.dataset.s===s)});
  document.querySelectorAll('.screen').forEach(function(x){x.classList.toggle('on',x.id==='sc-'+s)});
  document.getElementById('pageTitle').textContent=TITLES[s][0];
  renderCrumb(s);
  document.querySelector('.stage').scrollTop=0;
}
function goBack(){
  var s=backStack.length?backStack.pop():'home';
  go(s);
}
function renderCrumb(s){
  var el=document.getElementById('pageCrumb');
  if(SUBVIEWS[s]&&backStack.length){
    var prev=TITLES[backStack[backStack.length-1]];
    el.innerHTML='<span class="back" onclick="goBack()">‹ 返回 '+(prev?prev[0]:'首页')+'</span> · '+TITLES[s][1];
  }else{
    el.textContent=TITLES[s][1];
  }
}
document.getElementById('topSearch').onclick=function(){go('search')};

var toastEl=document.getElementById('toast');
function toast(m){
  toastEl.textContent=m;toastEl.style.bottom='24px';
  clearTimeout(toastEl._h);
  toastEl._h=setTimeout(function(){toastEl.style.bottom='-60px'},2400);
}

/* ============ 02 聚合搜索（跨类型：影视 + 书籍 + 漫画 + RSS） ============ */
var SR=[
 {t:'三体',y:2023,g:'科幻/奇幻',e:30,kind:'video',p:'p5',
  d:'纳米材料学家汪淼被警察史强带到联合作战中心，侦破科学家连环自杀案件。幽灵倒计时与三日凌空背后，是宏大的宇宙图景。',
  srcs:[['量子资源','ok','380ms'],['非凡CMS','ok','520ms'],['海阔JS源','slow','2.1s'],['影视图鉴','dead','—']],alt:4},
 {t:'三体 · 动画版',y:2022,g:'动画/科幻',e:15,kind:'video',p:'p3',
  d:'bilibili 出品《三体》动画，承接原著黑暗森林篇章，罗辑成为面壁者。',
  srcs:[['量子资源','ok','410ms'],['卧龙CMS','ok','600ms']],alt:2},
 {t:'三体 · 大电影',y:2024,g:'电影/科幻',e:1,kind:'video',p:'p2',
  d:'刘慈欣同名小说改编电影。',srcs:[['卧龙CMS','slow','1.8s'],['海阔JS源','ok','700ms']],alt:2},
 {t:'三体（全集）',y:'刘慈欣',g:'科幻小说',e:1,kind:'book',p:'p7',
  d:'文化大革命如火如荼进行的同时，军方探寻外星文明的绝秘计划"红岸工程"取得了突破性进展。按下发射键的那一刻，叶文洁彻底改变了人类的命运。',
  srcs:[['笔趣阁','ok','320ms'],['起点小说','ok','480ms'],['纵横中文','ok','560ms'],['轻小说文库','slow','1.4s']],alt:5},
 {t:'三体 · 漫画版',y:'幻创未来',g:'科幻漫画',e:32,kind:'comic',p:'p8',
  d:'官方授权改编漫画，以分镜语言重现红岸基地与三体游戏。',
  srcs:[['漫画柜','ok','640ms'],['咚漫·legado','ok','720ms']],alt:2}
];
var SR_CAT={all:87,video:23,book:41,comic:8,rss:9,live:6};
var srCat='all';

function renderSR(){
  var list=SR.filter(function(r){return srCat==='all'||r.kind===srCat});
  var box=document.getElementById('srList');
  if(!list.length){
    box.innerHTML='<div style="padding:46px;text-align:center;color:var(--muted)">该分类下暂无聚合结果 · 试试「全部」</div>';
    return;
  }
  box.innerHTML=list.map(function(r){
    var kindTag=r.kind==='book'?'<span class="tag acc">书籍</span>'
      :r.kind==='comic'?'<span class="tag gold">漫画</span>'
      :r.kind==='rss'?'<span class="tag orange">订阅</span>'
      :'<span class="tag green">影视</span>';
    var cnt=r.kind==='book'?('全 '+(r.e>1?r.e+'册':'1 册')):r.kind==='comic'?(r.e+' 话'):(r.e>1?r.e+'集':'1部');
    return '<div class="sr-item" onclick="openResult(\''+r.kind+'\')">'
      +'<div class="poster '+r.p+'"><div class="ph"><div class="t">'+r.t+'</div><div class="s">'+r.y+'</div></div></div>'
      +'<div class="body"><h3>'+r.t+' '+kindTag+'<span class="tag">'+r.y+'</span><span class="tag">'+cnt+'</span><span class="tag">'+r.g+'</span>'
      +(r.alt>1?'<span class="switch-src">⇄ 换源 '+r.alt+'</span>':'')+'</h3>'
      +'<div class="desc">'+r.d+'</div>'
      +'<div class="src-chips">'+r.srcs.map(function(s){
          return '<span class="src-chip '+s[1]+'"><span class="dot"></span>'+s[0]+' <span class="ms">'+s[2]+'</span></span>';
        }).join('')+'</div>'
      +'</div></div>';
  }).join('');
}
function openResult(kind){
  if(kind==='book'){go('reader');toast('打开书籍 → 阅读器')}
  else if(kind==='comic'){go('comic');toast('打开漫画 → 漫画阅读器（双页）')}
  else if(kind==='rss'){go('reader');toast('打开文章 → 阅读器')}
  else{go('detail')}
}
function runSearch(){
  var box=document.getElementById('srList');
  box.innerHTML='<div style="padding:30px;text-align:center;color:var(--muted)">扇出 '+SR_CAT[srCat]+' 源 · 并发 8 … <span class="pulse" style="display:inline-block;margin-left:8px"></span></div>';
  setTimeout(renderSR,900);
}
function pickCat(el,cat){
  document.querySelectorAll('#sc-search .cat-chip').forEach(function(x){x.classList.remove('on')});
  el.classList.add('on');srCat=cat;
  var names={all:'全部',video:'影视源',book:'书源',comic:'漫画源',rss:'RSS 源',live:'直播源'};
  document.getElementById('srMeta').innerHTML='<span class="pulse"></span>聚合 <b style="color:var(--cy)">'
    +SR_CAT[cat]+'</b> 个'+names[cat]+' · 归并 <b style="color:var(--cy)">'+ (cat==='all'?5:1) +'</b> 组结果 · 1.8s（渐进渲染）';
  renderSR();
}
document.getElementById('srRun').onclick=runSearch;
document.getElementById('srInput').addEventListener('keydown',function(e){if(e.key==='Enter')runSearch()});
renderSR();

/* ============ 03 书架 ============ */
/* [书名, 作者, 章节, 状态, 分组, 封面, 类型] */
var BOOKS=[
 ['诡秘之主','爱潜水的乌贼','第 892 章','阅读中 46%','未分组','p1','book'],
 ['大奉打更人','卖报小郎君','第 1,203 章','已读完','玄幻','p4','book'],
 ['深海余烬','远瞳','第 47 章','阅读中 12%','科幻','p6','book'],
 ['漫画 · 电锯人','藤本树','第 148 话','已读完','未分组','p3','comic'],
 ['灵境行者','卖报小郎君','第 217 章','阅读中 78%','玄幻','p2','book'],
 ['隐秘死角','闭嘴听我唱','第 55 章','未开始','未分组','p5','book'],
 ['三体','刘慈欣','第 1 章','未开始','科幻','p7','book'],
 ['我有一座冒险屋','我会修空调','第 1,058 章','阅读中 33%','未分组','p3','book'],
 ['深夜书屋','纯洁滴小龙','第 180 章','已读完','灵异','p1','book'],
 ['走进不科学','新海临风','第 88 章','阅读中 5%','科幻','p5','book']
];
var GROUPS=[['全部',''],['未分组','未分组'],['玄幻','玄幻'],['科幻','科幻'],['灵异','灵异']];
var curGroup='',curSort='recent',selBooks=[];

function groupCount(g){
  if(g==='')return BOOKS.length;
  return BOOKS.filter(function(b){return b[4]===g}).length;
}
function renderGroups(){
  var h='';
  GROUPS.forEach(function(g){
    var isAll=g[1]==='';
    var ic=isAll?'≡':(g[1]==='未分组'?'○':'▣');
    h+='<div class="bs-group'+(curGroup===g[1]?' on':'')+'" onclick="pickGroup(\''+g[1]+'\')">'
      +'<span class="g-ic">'+ic+'</span><span class="g-n">'+g[0]+'</span><span class="g-cnt">'+groupCount(g[1])+'</span></div>';
  });
  h+='<div class="bs-new" onclick="openGroupModal()">+ 新建分组</div>';
  document.getElementById('bsGroups').innerHTML=h;
  var ddEl=document.getElementById('grpSelDD');
  if(ddEl){
    var dd='<div onclick="moveSel(\'未分组\')">未分组</div>';
    GROUPS.slice(2).forEach(function(g){dd+='<div onclick="moveSel(\''+g[1]+'\')">'+g[0]+'</div>'});
    ddEl.innerHTML=dd;
  }
}
function renderToolbar(){
  var gname=GROUPS.find(function(g){return g[1]===curGroup});
  var title=(gname?gname[0]:'全部')+'书籍';
  document.getElementById('bsToolbar').innerHTML=
     '<div class="bs-title">'+title+' <span class="tag green" id="bsCount">0本</span></div>'
    +'<div class="bs-select" id="grpSel" onclick="event.stopPropagation();this.classList.toggle(\'open\')">移动至分组 ▾<div class="dd" id="grpSelDD"></div></div>'
    +'<div class="sort-chip'+(curSort==='recent'?' on':'')+'" onclick="pickSort(this,\'recent\')">最近阅读</div>'
    +'<div class="sort-chip'+(curSort==='name'?' on':'')+'" onclick="pickSort(this,\'name\')">书名</div>'
    +'<div class="sort-chip'+(curSort==='time'?' on':'')+'" onclick="pickSort(this,\'time\')">加入时间</div>';
  renderGroups();
}
function pickGroup(g){curGroup=g;renderGroups();renderBooks()}
function pickSort(el,s){curSort=s;document.querySelectorAll('#bsToolbar .sort-chip').forEach(function(x){x.classList.remove('on')});el.classList.add('on');renderBooks()}
function bookList(){
  var list=BOOKS.slice();
  if(curGroup!=='')list=list.filter(function(b){return b[4]===curGroup});
  if(curSort==='name')list.sort(function(a,b){return a[0].localeCompare(b[0],'zh')});
  else if(curSort==='time')list.reverse();
  return list;
}
function renderBooks(){
  var list=bookList();
  var cntEl=document.getElementById('bsCount');
  if(cntEl)cntEl.textContent=list.length+'本';
  var grid=document.getElementById('bookGrid');
  if(!list.length){grid.innerHTML='<div class="empty">该分组下暂无书籍</div>';return}
  grid.innerHTML=list.map(function(b){
    var sel=selBooks.indexOf(b[0])>=0;
    var pct=(b[3].match(/(\d+)%/)||[0,0])[1];
    return '<div class="book-card">'
      +(sel?'<div class="mk on" onclick="toggleSel(\''+b[0]+'\')">✓</div>':'<div class="mk" onclick="toggleSel(\''+b[0]+'\')">＋</div>')
      +'<div class="mk-x" onclick="delBook(\''+b[0]+'\')">×</div>'
      +'<div class="poster '+b[5]+'" onclick="openBook(\''+b[0]+'\',\''+b[6]+'\')"><div class="ph"><div class="t">'+b[0]+'</div><div class="s">'+b[3]+'</div></div></div>'
      +'<div class="nm">'+b[0]+(b[6]==='comic'?' <span class="tag gold" style="padding:0 4px">漫</span>':'')+'</div>'
      +'<div class="st">'+b[1]+' · '+b[2]+'</div>'
      +'<div class="prog-line"><i style="width:'+pct+'%"></i></div></div>';
  }).join('');
}
function toggleSel(n){
  var i=selBooks.indexOf(n);
  if(i>=0)selBooks.splice(i,1);else selBooks.push(n);
  renderBooks();toast(selBooks.length?('已选 '+selBooks.length+' 本 · 可移动到分组'):'已取消选择');
}
function moveSel(g){
  if(!selBooks.length){toast('请先勾选书籍');return}
  selBooks.forEach(function(n){var b=BOOKS.find(function(x){return x[0]===n});if(b)b[4]=g});
  selBooks=[];renderGroups();renderBooks();toast('已移动到分组：'+g);
  var gs=document.getElementById('grpSel');if(gs)gs.classList.remove('open');
}
function delBook(n){
  BOOKS=BOOKS.filter(function(b){return b[0]!==n});
  selBooks=selBooks.filter(function(x){return x!==n});
  renderGroups();renderBooks();toast('已从书架移除：'+n);
}
function openGroupModal(){
  var name=prompt('新建分组名称：','');
  if(name){GROUPS.push([name,name]);renderGroups();toast('已新建分组：'+name)}
}
function openBook(n,kind){
  if(kind==='comic'){go('comic');toast('打开漫画：'+n)}
  else{go('reader');toast('打开：'+n+' → 目录 / 换源 / 阅读')}
}
renderToolbar();renderBooks();

/* ============ 04 影视 ============ */
/* [标题, 来源, 类型, 进度, 时间, 分组, 封面, 标记, id, 排序权重] */
var MOVIES=[
 ['漫长的季节','量子资源','剧集','看到 08/30 集 · 62%','2 小时前','追剧','p5','fav',1,1],
 ['流浪地球 2','量子资源','电影','34:12 / 2:53:00 · 22%','昨天','未分组','p3','fav',2,2],
 ['三体 · 动画版','非凡CMS','动漫','第 24/30 话 · 81%','3 天前','动漫','p7','fav',3,4],
 ['宇宙探索编辑部','卧龙CMS','电影','已看完','5 天前','未分组','p2','fav',4,6],
 ['爱死机 S3','海阔JS','动漫','45%','1 周前','动漫','p1','fav',5,8],
 ['大明王朝 1566','量子资源','剧集','第 6/46 集 · 13%','2 周前','追剧','p4','fav',6,11],
 ['风味人间 S2','非凡CMS','纪录片','60%','3 周前','纪录片','p6','fav',7,12],
 ['狂飙','量子资源','剧集','已看完','4 天前','未分组','p2','hist',8,5],
 ['漫长的季节','卧龙CMS','剧集','15%','昨天','未分组','p5','hist',9,3],
 ['流浪地球 2','非凡CMS','电影','100%','上周','未分组','p3','hist',10,9],
 ['中国奇谭','海阔JS','动漫','第 4/8 话 · 50%','3 天前','未分组','p1','hist',11,7],
 ['舌尖上的中国','非凡CMS','纪录片','80%','2 周前','未分组','p6','hist',12,10]
];
var MGROUPS=[['全部收藏','@fav'],['未分组','未分组'],['追剧','追剧'],['动漫','动漫'],['纪录片','纪录片']];
var curMGroup='@fav',videoType='all',videoSort='recent',selMovies=[];

function movieList(){
  var list;
  if(curMGroup==='@hist')list=MOVIES.filter(function(m){return m[7]==='hist'});
  else if(curMGroup==='@fav')list=MOVIES.filter(function(m){return m[7]==='fav'});
  else list=MOVIES.filter(function(m){return m[7]==='fav'&&m[5]===curMGroup});
  if(videoType!=='all')list=list.filter(function(m){return m[2]===videoType});
  if(videoSort==='recent')list=list.slice().sort(function(a,b){return a[9]-b[9]});
  else if(videoSort==='name')list=list.slice().sort(function(a,b){return a[0].localeCompare(b[0],'zh')});
  else if(videoSort==='progress')list=list.slice().sort(function(a,b){return pctOf(b)-pctOf(a)});
  return list;
}
function pctOf(m){var p=m[3].match(/(\d+)%/);return p?parseInt(p[1],10):100}
function mGroupCount(g){
  if(g==='@fav')return MOVIES.filter(function(m){return m[7]==='fav'}).length;
  return MOVIES.filter(function(m){return m[7]==='fav'&&m[5]===g}).length;
}
function renderVdGroups(){
  var h='<div class="bs-sec">收藏</div>';
  MGROUPS.forEach(function(g){
    var isAll=g[1]==='@fav';
    var ic=isAll?'≡':(g[1]==='未分组'?'○':'▣');
    h+='<div class="bs-group'+(curMGroup===g[1]?' on':'')+'" onclick="pickVdGroup(\''+g[1]+'\')">'
      +'<span class="g-ic">'+ic+'</span><span class="g-n">'+g[0]+'</span><span class="g-cnt">'+mGroupCount(g[1])+'</span></div>';
  });
  h+='<div class="bs-sec">历史</div>'
    +'<div class="bs-group'+(curMGroup==='@hist'?' on':'')+'" onclick="pickVdGroup(\'@hist\')"><span class="g-ic">≡</span><span class="g-n">观看历史</span><span class="g-cnt">'+MOVIES.filter(function(m){return m[7]==='hist'}).length+'</span></div>';
  h+='<div class="bs-new" onclick="openVdGroupModal()">+ 新建分组</div>';
  document.getElementById('vdGroups').innerHTML=h;
  var ddEl=document.getElementById('vdGrpSelDD');
  if(ddEl){
    var dd='<div onclick="moveVdSel(\'未分组\')">未分组</div>';
    MGROUPS.slice(2).forEach(function(g){dd+='<div onclick="moveVdSel(\''+g[1]+'\')">'+g[0]+'</div>'});
    ddEl.innerHTML=dd;
  }
}
function renderVdToolbar(){
  var isHist=curMGroup==='@hist';
  var cnt=movieList().length;
  var gname=MGROUPS.find(function(g){return g[1]===curMGroup});
  var title=isHist?'观看历史':('收藏'+(gname?' · '+gname[0]:''));
  var types=['全部','剧集','电影','动漫','纪录片'];
  var typeChips=types.map(function(t){
    return '<div class="sort-chip'+(videoType===(t==='全部'?'all':t)?' on':'')+'" onclick="pickVideoType(this,\''+t+'\')">'+t+'</div>'}).join('');
  var sorts=[['recent','最近'],['name','标题'],['progress','进度']];
  var sortChips=sorts.map(function(s){
    return '<div class="sort-chip'+(videoSort===s[0]?' on':'')+'" onclick="pickVideoSort(this,\''+s[0]+'\')">'+s[1]+'</div>'}).join('');
  document.getElementById('vdToolbar').innerHTML='<div class="bs-title">'+title+' <span class="tag green">'+cnt+'部</span></div>'
    +'<div style="width:1px;height:20px;background:var(--line2)"></div>'+typeChips
    +'<div style="width:1px;height:20px;background:var(--line2)"></div>'+sortChips
    +(!isHist?'<div class="bs-select" id="vdGrpSel" onclick="event.stopPropagation();this.classList.toggle(\'open\')">移动至分组 ▾<div class="dd" id="vdGrpSelDD"></div></div>':'')
    +'<button class="btn sm danger" onclick="delSel()">'+(selMovies.length?'删除选中 ('+selMovies.length+')':'删除选中')+'</button>';
  renderVdGroups();
}
function pickVideoType(el,t){videoType=(t==='全部'?'all':t);renderVdToolbar();renderVdMovies()}
function pickVideoSort(el,s){videoSort=s;renderVdToolbar();renderVdMovies()}
function pickVdGroup(g){curMGroup=g;selMovies=[];renderVdToolbar();renderVdMovies()}
function renderVdMovies(){
  var list=movieList();
  var grid=document.getElementById('vdGrid');
  if(!list.length){grid.innerHTML='<div class="empty">该筛选下暂无内容</div>';return}
  grid.innerHTML=list.map(function(m){
    var sel=selMovies.indexOf(m[8])>=0;
    return '<div class="book-card">'
      +(sel?'<div class="mk on" onclick="toggleSelMovie('+m[8]+')">✓</div>':'<div class="mk" onclick="toggleSelMovie('+m[8]+')">＋</div>')
      +'<div class="mk-x" onclick="delMovie('+m[8]+')">×</div>'
      +'<div class="poster '+m[6]+'" onclick="openMovie('+m[8]+')"><div class="ph"><div class="t">'+m[0]+'</div><div class="s">'+m[1]+'</div></div></div>'
      +'<div class="nm">'+m[0]+'</div><div class="st">'+m[1]+' · '+m[2]+' · '+m[4]+'</div>'
      +'<div class="prog-line"><i style="width:'+pctOf(m)+'%"></i></div></div>';
  }).join('');
}
function toggleSelMovie(id){
  var i=selMovies.indexOf(id);
  if(i>=0)selMovies.splice(i,1);else selMovies.push(id);
  renderVdMovies();renderVdToolbar();
  if(selMovies.length)toast('已选 '+selMovies.length+' 部 · 可批量删除');
}
function delMovie(id){
  MOVIES=MOVIES.filter(function(m){return m[8]!==id});
  selMovies=selMovies.filter(function(x){return x!==id});
  renderVdToolbar();renderVdMovies();toast('已删除 1 部');
}
function delSel(){
  if(!selMovies.length){toast('请先勾选要删除的影视');return}
  var n=selMovies.length;
  MOVIES=MOVIES.filter(function(m){return selMovies.indexOf(m[8])<0});
  selMovies=[];
  renderVdToolbar();renderVdMovies();toast('已批量删除 '+n+' 部');
}
function moveVdSel(g){
  if(!selMovies.length){toast('请先勾选影视');return}
  selMovies.forEach(function(id){var m=MOVIES.find(function(x){return x[8]===id});if(m)m[5]=g});
  selMovies=[];renderVdToolbar();renderVdMovies();toast('已移动到分组：'+g);
  var gs=document.getElementById('vdGrpSel');if(gs)gs.classList.remove('open');
}
function openVdGroupModal(){
  var name=prompt('新建分组名称：','');
  if(name){MGROUPS.push([name,name]);renderVdToolbar();toast('已新建分组：'+name)}
}
function openMovie(id){
  var m=MOVIES.find(function(x){return x[8]===id});
  if(m){go('player');toast('打开：'+m[0]+' → 继续播放')}
}
renderVdToolbar();renderVdMovies();

/* ============ 05/06/07 发现页（书院 / 影院 / RSS 共用组件） ============ */
var DISC={
  bookhall:{key:'bookhall',label:'书院',
    srcs:[['笔趣阁·示例源','legado 书源 · 规则发现','文'],
          ['轻小说文库','JSON API 型 · 分类发现','文'],
          ['晋江文学城','RSS 型 · 榜单发现','文']],
    cats:['玄幻','都市','科幻','历史','言情','轻小说','悬疑','武侠'],
    pool:['诡秘之主','大奉打更人','深海余烬','灵境行者','隐秘死角','三体','我有一座冒险屋','深夜书屋','走进不科学','宿命之环','道诡异仙','赤心巡天'],
    au:['爱潜水的乌贼','卖报小郎君','远瞳','刘慈欣','我会修空调','纯洁滴小龙'],
    pal:['p1','p2','p3','p4','p5','p6','p7','p8'],
    meta:'共 48 条 · 同步于 3 分钟前',target:'detail'},
  cinema:{key:'cinema',label:'影院',
    srcs:[['量子资源','CMS(json) · 分类发现','影'],
          ['卧龙资源','CMS(xml) · 分类发现','影'],
          ['海阔·影视JS','hiker JS 源 · 发现','影'],
          ['drpy·豆瓣','drpy XP源 · 发现','影']],
    cats:['电影','电视剧','动漫','综艺','纪录片','短剧','欧美','国产'],
    pool:['漫长的季节','流浪地球 2','三体','大明王朝 1566','宇宙探索编辑部','风味人间','爱死机 S3','中国奇谭','狂飙','沙丘 2','奥本海默','繁花'],
    au:['量子资源','卧龙CMS','非凡CMS','海阔JS','drpy'],
    pal:['p5','p3','p7','p4','p2','p6','p1','p8'],
    meta:'共 126 部 · 换源可用',target:'detail'},
  rss:{key:'rss',label:'RSS',
    srcs:[['少数派 · 效率','科技效率资讯','R'],
          ['少数派 · 生活','生活随笔','R'],
          ['爱范儿','数码资讯','R'],
          ['阮一峰 · 周刊','技术周刊','R']],
    cats:['全部','科技','效率','数码','生活','开发','设计','播客'],
    pool:['深度评测：如何构建高效信息流','用一套规则引擎统一管理你的信息源','周刊第 320 期：工具与自动化','我把 RSS 阅读器改造了一遍','设计师的效率工具箱 2026','周末读物：慢下来的技术','播客笔记：关于专注力','每月书单：八月'],
    au:['少数派','爱范儿','阮一峰','效率志'],
    pal:['p6','p7','p1','p3','p5','p2','p8','p4'],
    meta:'共 32 条 · 同步于 10 分钟前',target:'reader'}
};
var curSrc={bookhall:0,cinema:0,rss:0};
var curCat={bookhall:'玄幻',cinema:'电影',rss:'全部'};

function discEls(kind){
  return {
    list:document.getElementById(kind==='bookhall'?'bhSrcList':kind==='cinema'?'cnSrcList':'rsSrcList'),
    catLine:document.getElementById(kind==='bookhall'?'bhCatLine':kind==='cinema'?'cnCatLine':'rsCatLine'),
    name:document.getElementById(kind==='bookhall'?'bhSrcName':kind==='cinema'?'cnSrcName':'rsSrcName'),
    content:document.getElementById(kind==='bookhall'?'bhContent':kind==='cinema'?'cnContent':'rsContent')
  };
}
function renderDiscSrcList(kind,filter){
  var d=DISC[kind],els=discEls(kind);
  els.list.innerHTML=d.srcs.map(function(s,idx){
    if(filter&&(s[0].indexOf(filter)<0&&s[1].indexOf(filter)<0))return '';
    return '<div class="dis-src'+(curSrc[kind]===idx?' on':'')+'" onclick="pickDiscSrc(\''+kind+'\','+idx+')">'
      +'<div class="ic">'+s[2]+'</div><div class="tx"><b>'+s[0]+'</b><span>'+s[1]+'</span></div>'
      +'<span class="cnt">'+(kind==='bookhall'?(idx===0?'12类':'8类'):kind==='cinema'?(idx===0?'8类':'6类'):'4类')+'</span></div>';
  }).join('')||'<div style="padding:16px;color:var(--faint);font-size:12px">无匹配的源</div>';
}
function renderDiscContent(kind){
  var d=DISC[kind],els=discEls(kind),cat=curCat[kind];
  var seed=curSrc[kind]*7+cat.length;
  var grid=d.pool.map(function(t,i){
    var idx=(i+seed)%d.pool.length;
    var title=d.pool[idx];
    var au=d.au[(i+seed)%d.au.length];
    var p=d.pal[(i+seed)%d.pal.length];
    return '<div class="disc-card" onclick="openDiscItem(\''+kind+'\',\''+title.replace(/'/g,'')+'\')">'
      +'<div class="poster '+p+'"><div class="ph"><div class="t">'+title+'</div><div class="s">'+(kind==='cinema'?cat:au)+'</div></div></div>'
      +'<div class="nm">'+title+'</div><div class="au">'+(kind==='cinema'?au+' · '+cat:au)+'</div></div>';
  }).join('');
  els.content.innerHTML='<div class="sec-head"><h2 style="font-size:15px">'+cat+'</h2>'
    +'<span class="sub">'+d.meta+'</span>'
    +'<span class="more" onclick="toast(\'刷新：'+d.srcs[curSrc[kind]][0]+' / '+cat+'\')">刷新 ↻</span></div>'
    +'<div class="disc-grid">'+grid+'</div>';
}
function renderDisc(kind){
  var d=DISC[kind],els=discEls(kind);
  renderDiscSrcList(kind,'');
  els.name.textContent=d.srcs[curSrc[kind]][0];
  els.catLine.innerHTML='<span class="cl-label">分类</span>'+d.cats.map(function(c){
    return '<div class="cat-chip'+(curCat[kind]===c?' on':'')+'" onclick="pickDiscCat(\''+kind+'\',this,\''+c+'\')">'+c+'</div>'}).join('');
  renderDiscContent(kind);
}
function pickDiscSrc(kind,idx){
  curSrc[kind]=idx;
  var d=DISC[kind];
  document.getElementById(kind==='bookhall'?'bhSrcName':kind==='cinema'?'cnSrcName':'rsSrcName').textContent=d.srcs[idx][0];
  renderDiscSrcList(kind,'');
  renderDiscContent(kind);
  toast('切换源：'+d.srcs[idx][0]);
}
function pickDiscCat(kind,el,cat){
  document.querySelectorAll('#sc-'+kind+' .cat-line .cat-chip').forEach(function(x){x.classList.remove('on')});
  el.classList.add('on');curCat[kind]=cat;renderDiscContent(kind);
}
function filterDiscover(kind,v){
  renderDiscSrcList(kind,v.trim());
}
function openDiscItem(kind,t){
  if(DISC[kind].target==='detail'){go('detail');toast('打开影片：'+t+' · 详情页（换源）')}
  else{go('reader');toast('打开'+(kind==='rss'?'文章':'书籍')+'：'+t+' → 阅读器')}
}
renderDisc('bookhall');renderDisc('cinema');renderDisc('rss');

/* ============ 08 直播 + EPG ============ */
var CH=[
 ['📺 央视',['CCTV-1 综合','CCTV-2 财经','CCTV-3 综艺','CCTV-5 体育','CCTV-6 电影','CCTV-13 新闻','CCTV-4K 超高清']],
 ['🌐 卫视',['湖南卫视','浙江卫视','东方卫视','江苏卫视','北京卫视','深圳卫视']],
 ['🎬 影视',['CHC 动作电影','CHC 家庭影院','凤凰电影','影视轮播·武侠']],
 ['🎵 地方/特色',['广东珠江','上海新闻综合','音乐轮播·90s','纪录频道']]
];
var PROGS=[
 {title:'新闻联播',desc:'中央电视台综合频道每晚 19 点播出的新闻节目',
  list:[[0,8,'18:30 晚间新闻'],[8,14,'19:00 新闻联播'],[14,16.5,'19:30 天气预报'],[16.5,19,'19:32 焦点访谈'],[19,31,'19:56 黄金剧场'],[31,44,'20:46 剧场续播'],[44,50,'21:30 新闻直播间']],
  now:1,rule:12},
 {title:'黄金剧场 · 人世间',desc:'现实主义题材电视剧，讲述普通家庭跨越五十年的命运变迁',
  list:[[0,10,'19:00 新闻联播'],[10,18,'19:30 今日说法'],[18,30,'20:06 人世间 23'],[30,42,'21:00 人世间 24'],[42,50,'21:40 晚间新闻']],
  now:2,rule:26},
 {title:'体育赛事直播',desc:'赛事信号直转，EPG 由 xmltv 数据源关联',
  list:[[0,12,'19:00 体育世界'],[12,26,'19:30 赛事直播'],[26,38,'20:30 赛事集锦'],[38,50,'21:30 体育新闻']],
  now:1,rule:20}
];
var curChan='CCTV-1 综合',favs={},curProg=0;

function renderLive(filter){
  filter=filter||'';
  var h='';
  CH.forEach(function(g){
    var list=filter?g[1].filter(function(n){return n.indexOf(filter)>=0}):g[1];
    if(!list.length)return;
    h+='<div class="live-group"><div class="gt"><b>'+g[0]+'</b><span>'+list.length+'</span></div>';
    list.forEach(function(n){
      var on=curChan===n;
      h+='<div class="chan'+(on?' on':'')+'" onclick="pickChan(\''+n+'\')">'
        +'<span class="playing-dot" style="display:'+(on?'inline-block':'none')+'"></span>'+n
        +'<span class="fav" style="'+(favs[n]?'opacity:1;color:var(--gold)':'')+'" onclick="event.stopPropagation();toggleFav(\''+n+'\')">'+(favs[n]?'★':'☆')+'</span></div>';
    });
    h+='</div>';
  });
  document.getElementById('liveSide').innerHTML=h||'<div style="padding:20px;color:var(--faint);font-size:12px">未找到匹配频道</div>';
}
function pickChan(n){
  curChan=n;
  var sum=0;for(var i=0;i<n.length;i++)sum+=n.charCodeAt(i);
  curProg=sum%PROGS.length;
  renderLive(document.getElementById('liveSearch').value);
  renderEpg();
  document.getElementById('liveNowName').textContent=n+' · 直播中';
}
function toggleFav(n){
  favs[n]=!favs[n];
  renderLive(document.getElementById('liveSearch').value);
  toast(favs[n]?('已收藏频道：'+n):('已取消收藏：'+n));
}
function filterChan(v){renderLive(v)}
function renderEpg(){
  var p=PROGS[curProg];
  document.getElementById('epgChan').textContent=curChan;
  document.getElementById('epgTitle').textContent=p.title;
  document.getElementById('epgDesc').textContent=p.desc;
  document.getElementById('epgTime').textContent='正在播出 · '+p.list[p.now][2].slice(0,5)+' - '+p.list[Math.min(p.now+1,p.list.length-1)][2].slice(0,5);
  var W=100/50,tl='';
  p.list.forEach(function(b,i){
    var cls=i===p.now?'now':(i<p.now?'past':'');
    tl+='<div class="epg-block '+cls+'" style="left:'+(b[0]*W)+'%;width:'+((b[1]-b[0])*W)+'%" onclick="toast(\''+b[2]+'\')">'+b[2]+'</div>';
  });
  tl+='<div class="epg-rule" style="left:'+(p.rule*W)+'%"></div>';
  document.getElementById('epgTl').innerHTML=tl;
  document.getElementById('epgNext').innerHTML=p.list.slice(p.now+1).map(function(b){
    return '<span class="up">⏭ '+b[2]+'</span>'}).join('');
}
renderLive('');renderEpg();

/* ============ 12 详情：多线路 + 正倒序 ============ */
var EP_NAMES=['科学边界','倒计时','射手与农场主','三体问题','红岸基地','宇宙闪烁','背叛','三体游戏','黑暗森林','古筝行动','面壁者','破壁人','黑暗战役','威慑纪元','执剑人','广播纪元','云天明的童话','掩体纪元','二向箔','归零者','时间线之外','四维碎块','蓝色空间','万有引力','星舰地球','智子','水滴','死线','光墓','宇宙田园'];
var DSRC=['量子资源','非凡CMS','蓝光影院','快手影视'];
var curDSrc=0,epOrder='asc',curEp=0;

function renderEps(){
  var names=EP_NAMES.slice(0,30);
  var idx=names.map(function(_,i){return i});
  if(epOrder==='desc')idx.reverse();
  document.getElementById('epGrid').innerHTML=idx.map(function(i){
    var n=i+1;
    return '<div class="ep'+(curEp===i?' on':'')+'" onclick="playEp('+i+')">'+(n<10?'0'+n:n)+' '+names[i]+'</div>';
  }).join('');
}
function pickDSrc(i,silent){
  curDSrc=i;
  [0,1,2,3].forEach(function(k){
    var el=document.getElementById('ds'+k);
    if(el){el.className=k===i?'tag cy':'tag';}
  });
  renderEps();
  if(!silent) toast('切换播放线路：'+DSRC[i]);
}
function toggleOrder(){
  epOrder=epOrder==='asc'?'desc':'asc';
  document.getElementById('orderBtn').textContent=epOrder==='asc'?'⇅ 正序':'⇅ 倒序';
  renderEps();
}
function playEp(i){curEp=i;renderEps();go('player');renderSideEps();toast('播放 第'+(i+1)+'集 · '+EP_NAMES[i]+'（'+DSRC[curDSrc]+'）')}
pickDSrc(0,true);

/* ============ 13 播放器 ============ */
var EP_DUR=['42:10','43:25','41:50','44:12','42:33','45:08','43:44','42:17','44:50','41:36','45:22','43:09','42:48','46:01','43:37','44:25','42:02','45:40','43:18','41:55','44:08','42:29','45:13','43:52','42:41','44:36','41:28','45:47','43:03','42:20'];
function renderSideEps(){
  document.getElementById('sideEps').innerHTML=EP_NAMES.map(function(n,i){
    var no=i+1;
    return '<div class="ep-item-side'+(curEp===i?' on':'')+'" onclick="switchEp('+i+')">'
      +'<span>'+(no<10?'0'+no:no)+' '+n+'</span><span class="dur">'+EP_DUR[i]+'</span></div>';
  }).join('');
  var nx=curEp+1;
  document.getElementById('nxEp').textContent=nx<30?('第'+(nx<10?'0'+nx:nx)+'集 '+EP_NAMES[nx]):'已是最后一集';
  document.getElementById('plTitle').textContent='三体 · 第'+(curEp<9?'0'+(curEp+1):curEp+1)+'集 · '+EP_NAMES[curEp];
  document.getElementById('playerSub').textContent='点击播放 · 三体 第'+(curEp<9?'0'+(curEp+1):curEp+1)+'集 '+EP_NAMES[curEp];
}
function switchEp(i){
  curEp=i;renderSideEps();renderEps();
  var el=document.querySelector('.ep-item-side.on');
  if(el)el.scrollIntoView({block:'nearest'});
}
function nextEp(){
  if(curEp>=29){toast('已是最后一集');return}
  switchEp(curEp+1);toast('下一集：'+EP_NAMES[curEp]);
}
function prevEp(){
  if(curEp<=0){toast('已是第一集');return}
  switchEp(curEp-1);toast('上一集：'+EP_NAMES[curEp]);
}
renderSideEps();

/* ============ 14 阅读器 ============ */
var PAGES=[
 ['第八百九十一章 · 灰雾之上','　　克莱恩缓缓睁开眼睛，发现自己置身于一片浩瀚的灰雾之中。头顶上方，绯红之月悬挂，散发着蒙蒙的光辉。\n\n　　"这是……灰雾之上。"他轻声自语，意识到自己又一次进入了那个神秘的空间。\n\n　　长长的青铜桌沿伸向远方，二十二个位置依次排开。属于他的那个位置，静静矗立着一张古旧的座椅。\n\n　　而在桌子的另一端，一个模糊的影子正在缓缓成形……\n\n　　克莱恩心头一凛，右手按在了胸口的吊坠上。'],
 ['第八百九十一章 · 灰雾之上（2/4）','　　"不属于这个时代的声音，你终于注意到了吗？"那个影子开口了，声音仿佛来自极其遥远的地方。\n\n　　克莱恩沉默几秒，郑重地行了一礼："晚上好，先生。不知您是……"\n\n　　"你可以称呼我为『愚者』的邻居。"影子微微晃动，像是一团被风吹拂的雾气。\n\n　　桌面上，一支羽毛笔凭空浮现，开始在泛黄的羊皮纸上书写……'],
 ['第八百九十一章 · 灰雾之上（3/4）','　　克莱恩接过那张凭空飘来的羊皮纸，上面用古赫语写着一行字：\n\n　　"值夜者的血，封印之门，贝克兰德的雾，三者交汇之时……"\n\n　　字迹到此戛然而止，仿佛被什么东西强行截断。\n\n　　"这是什么意思？"他抬起头，但对面已经空无一物，只剩下缓缓消散的灰雾……'],
 ['第八百九十一章 · 灰雾之上（4/4）','　　意识回归肉体，克莱恩猛地坐起，冷汗浸透了睡衣。\n\n　　窗外，贝克兰德的浓雾一如既往，路灯的光晕在雾中显得朦胧而昏黄。\n\n　　"愚者的邻居……值夜者的血……"他喃喃重复着，翻出笔记本，将那行古语一字不落地抄录下来。\n\n　　（本章完）\n\n　　　　—— 点击页面继续翻页 ——']
];
var TOC=['第八百八十八章 · 命运的馈赠','第八百八十九章 · 序列一','第八百九十章 · 奇迹师','第八百九十一章 · 灰雾之上','第八百九十二章 · 塔罗会','第八百九十三章 · 值夜者','第八百九十四章 · 神之途径','第八百九十五章 · 封印物'];
var rdCur=0,rdSize=17,rdLH=2.05;
function renderRd(){
  var p=PAGES[rdCur];
  document.getElementById('rdTitle').textContent=p[0];
  document.getElementById('rdBookTitle').textContent=p[0];
  var body=document.getElementById('rdBody');
  body.textContent=p[1];
  body.style.fontSize=rdSize+'px';
  body.style.lineHeight=rdLH;
  document.getElementById('rdPos').textContent='第 891 章 · '+(rdCur+1)+'/'+PAGES.length+' 页';
  document.getElementById('tocList').innerHTML=TOC.map(function(t,i){
    return '<div class="toc-item'+(i===3?' on':'')+'" onclick="toast(\'跳转：'+t+'\')">'+t+'</div>'}).join('');
}
function flipPage(d){
  d=(d===undefined||d===null)?1:d;
  var n=rdCur+d;
  if(n<0||n>=PAGES.length){toast(d>0?'本章末页 · 加载下一章（nextContentUrl 续链）':'本章首页');return}
  rdCur=n;renderRd();
}
function rdFont(d){rdSize=Math.max(13,Math.min(26,rdSize+d));renderRd()}
function rdLine(d){rdLH=Math.max(1.5,Math.min(2.8,Math.round((rdLH+d)*100)/100));renderRd();toast('行距：'+rdLH)}
function rdTheme(t){
  var pg=document.getElementById('readerPage');
  pg.className='reader-page '+t;
  document.querySelectorAll('.theme-dot').forEach(function(d){d.classList.remove('on')});
  var dot=document.querySelector('.theme-dot.'+t);
  if(dot)dot.classList.add('on');
}
function toggleToc(){document.getElementById('tocDrawer').classList.toggle('open')}
renderRd();

/* ============ 15 漫画阅读器 ============ */
var cmChapter=148,cmPage=1,cmTotal=32,cmMode='dual';
function renderComic(){
  document.getElementById('cmTitle').textContent='第 '+cmChapter+' 话 · 暗之恶魔';
  document.getElementById('cmLeft').textContent='第 '+cmChapter+' 话 · 左页';
  document.getElementById('cmRight').textContent='第 '+cmChapter+' 话 · 右页';
  document.getElementById('cmPageNo').textContent='第 '+cmPage+' / '+cmTotal+' 页';
  document.getElementById('cmCounter').textContent=cmPage+'/'+cmTotal;
  var slider=document.querySelector('#sc-comic input[type=range]');
  if(slider)slider.value=cmPage;
}
function gotoComicPage(v){cmPage=parseInt(v,10)||1;renderComic()}
function flipChapter(d){
  cmChapter+=d;cmPage=1;renderComic();
  toast(d>0?('下一话：第 '+cmChapter+' 话'):('上一话：第 '+cmChapter+' 话'));
}
function pickComicMode(el,mode){
  document.querySelectorAll('.comic-mode button').forEach(function(b){b.classList.remove('on')});
  el.classList.add('on');cmMode=mode;
  var pg=document.getElementById('comicPage');
  pg.className='comic-page '+mode;
  document.getElementById('cmModeTag').textContent=mode==='dual'?'双页模式':mode==='single'?'单页模式':'条漫模式';
  toast('漫画模式：'+(mode==='dual'?'双页':mode==='single'?'单页':'条漫瀑布流'));
}
renderComic();

/* ============ 09 规则工坊 ============ */
var CODE={
 jsoup:['<span class="c-com">// JSoup 类选择器（legado 默认，无需前缀）</span>',
        '<span class="c-attr">class.result-list</span>.<span class="c-num">0</span>@<span class="c-rule">tag.div</span>.<span class="c-num">-1</span>@<span class="c-fn">tag.h3</span>.<span class="c-num">0</span>@<span class="c-rule">text</span>'],
 css:['<span class="c-com">// CSS 选择器：@css: 前缀 → cheerio 引擎</span>',
      '<span class="c-rule">@css:</span><span class="c-str">.result-list &gt; div:last-child h3:first-of-type</span>@<span class="c-rule">text</span>',
      '',
      '<span class="c-com">// 备用链：|| 取先命中 · &amp;&amp; 串联传递</span>',
      '<span class="c-attr">.bookname a</span>@<span class="c-rule">text</span> <span class="c-key">||</span> <span class="c-attr">h4.title</span>@<span class="c-rule">text</span>'],
 xpath:['<span class="c-com">// XPath：// 前缀</span>',
        '<span class="c-rule">//</span><span class="c-fn">div</span>[<span class="c-attr">@class</span>=<span class="c-str">"result-list"</span>]/<span class="c-fn">div</span>[<span class="c-num">last()</span>]/<span class="c-fn">h3</span>/<span class="c-str">text()</span>'],
 jsonpath:['<span class="c-com">// JSONPath：$. 前缀（API 型书源）</span>',
        '<span class="c-rule">$.</span><span class="c-attr">data</span>.<span class="c-attr">list</span>[<span class="c-num">*</span>].<span class="c-attr">bookName</span>',
        '',
        '<span class="c-com">// 带过滤器</span>',
        '<span class="c-rule">$.</span><span class="c-attr">items</span>[?(<span class="c-attr">@.type</span>==<span class="c-str">\'book\'</span>)].<span class="c-attr">title</span>'],
 regex:['<span class="c-com">// 正则捕获：: 前缀（从文本/JS结果中提取）</span>',
        '<span class="c-rule">:</span><span class="c-str">search\\("(.+?)"\\)</span>'],
 js:['<span class="c-com">// 纯 JS：@js: / &lt;js&gt; 块 · QuickJS-WASM 沙箱执行</span>',
     '<span class="c-rule">@js:</span><span class="c-key">var</span> el = <span class="c-var">result</span>.<span class="c-fn">select</span>(<span class="c-str">".result-list h3"</span>);',
     '<span class="c-key">var</span> name = el.<span class="c-fn">text</span>().<span class="c-fn">replace</span>(<span class="c-str">/\\s+/g</span>, <span class="c-str">" "</span>).<span class="c-fn">trim</span>();',
     'name.<span class="c-fn">substring</span>(<span class="c-num">0</span>, <span class="c-num">40</span>);  <span class="c-com">// 返回值即结果</span>'],
 tpl:['<span class="c-com">// {{ }} 模板变量插值（任意步骤可用）</span>',
      '<span class="c-key">searchUrl</span>: <span class="c-str">"/search?kw={{key}}&amp;page={{page}}"</span>,',
      '<span class="c-attr">nextUrl</span>: <span class="c-str">"{{baseUrl}}/page/{{page}}?id={{result.id}}"</span>'],
 mix:['<span class="c-com">// ✦ 混合规则（社区书源真实写法）：段-步两级流水线</span>',
      '<span class="c-com">// L1 按 || 切段 → 段A(JSoup) 失败时走 段B(JsonPath) → 段C(纯JS)</span>',
      '<span class="c-attr">id.content</span>@<span class="c-rule">textNodes</span><span class="c-key">##</span><span class="c-str">(\\s*&lt;br\\s*/?&gt;\\s*)+</span><span class="c-key">##</span><span class="c-str">\\n</span>',
      '<span class="c-key">||</span> <span class="c-rule">$.</span><span class="c-attr">data</span>.<span class="c-attr">content</span>',
      '<span class="c-key">||</span> <span class="c-rule">@js:</span><span class="c-var">result</span> ? <span class="c-var">result</span>.<span class="c-fn">trim</span>() : <span class="c-str">""</span>',
      '',
      '<span class="c-com">// 串联传递（&amp;&amp;）：JSoup 输出 → CSS 继续选 → {{}} 内插 → 正则净化</span>',
      '<span class="c-attr">class.box</span>.<span class="c-num">0</span>@<span class="c-rule">tag.div</span> <span class="c-key">&amp;&amp;</span> <span class="c-rule">@css:</span><span class="c-str">.text p</span>@<span class="c-rule">text</span>',
      '<span class="c-key">&amp;&amp;</span> <span class="c-rule">{{</span><span class="c-fn">baseUrl</span><span class="c-rule">}}</span>/next <span class="c-key">&amp;&amp;</span> <span class="c-rule">:</span><span class="c-str">page=(\\d+)</span>']
};
var SE_NAME={jsoup:'JSOUP',css:'CSS',xpath:'XPATH',jsonpath:'JSONPATH',regex:'REGEX',js:'JS·QuickJS',tpl:'TPL·Template',mix:'MIX·Pipeline'};
var VIS_ROWS={
 jsoup:[['bookList','class.result-list.0@tag.div','12 节点'],['name','tag.h3.0@text','"三体"'],['author','tag.span@text','"刘慈欣"']],
 css:[['bookList','.result-list > div','12 节点'],['name','.result-list h3@text','"三体"'],['bookUrl','.result-list a@href','/book/1024/']],
 xpath:[['chapterList','//div[@class="list"]//a','1,432 章'],['chapterName','./text()','"第八百九十一章"']],
 jsonpath:[['content','$.data.content','8.4 KB'],['nextContentUrl','$.data.next','"/next/2"']],
 regex:[['coverUrl',':src="(.+?)"','https://.../c.jpg'],['page',':page=(\\d+)','"2"']],
 js:[['init','<js>var u=baseUrl+"/x";u</js>','https://.../x'],['nextTocUrl','@js:result+1','"2"']],
 mix:[['content','id.content@textNodes##<br>##\\n || $.data.content','8.4 KB'],['nextContentUrl','@js:result?result.trim():""','""']]
};
var curSe='css';
function renderCode(){
  document.getElementById('codeArea').innerHTML=CODE[curSe].map(function(l,i){
    return '<div class="code-line"><span class="ln">'+(i+1)+'</span><span class="cd">'+(l||'&nbsp;')+'</span></div>';
  }).join('');
  var rows=VIS_ROWS[curSe]||VIS_ROWS.css;
  document.getElementById('visView').innerHTML=rows.map(function(r){
    return '<div class="vis-row"><span class="vk">'+r[0]+'</span><span class="vr">'+r[1].replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</span><span class="vo">→ '+r[2]+'</span></div>';
  }).join('')+'<div style="padding:12px;font-size:11px;color:var(--faint);font-family:var(--mono)">可视化视图：字段 → 规则 → 上次调试产出（点击「源码」切回编辑）</div>';
}
function pickSe(el,se){
  document.querySelectorAll('.snippet-tag').forEach(function(x){x.classList.remove('on')});
  el.classList.add('on');curSe=se;
  document.getElementById('dbgEngine').textContent=SE_NAME[se];
  renderCode();resetDbg();
}
function pickEditorMode(el,mode){
  document.querySelectorAll('#seMode .se-tab').forEach(function(x){x.classList.remove('on')});
  el.classList.add('on');
  document.getElementById('codeArea').classList.toggle('on',mode==='code');
  document.getElementById('visView').classList.toggle('on',mode==='vis');
}
function pickField(el,name){
  document.querySelectorAll('.field-item').forEach(function(x){x.classList.remove('on')});
  el.classList.add('on');
  document.getElementById('stField').textContent=name;
  toast('切换字段：'+name);
}
renderCode();

var DBG=[
 {t:'规则切分（段级 L1-L2）',ic:'fx',ms:'1ms',body:'<div class="kv"><span class="k">原始规则</span><span class="v">@css:.result-list h3@text || tag.h3@text</span></div><div class="kv"><span class="k">切分</span><span class="v hl-ok">2 段（|| fallback 链，跳过 {{}} 与 &lt;js&gt; 内分隔符）</span></div><div class="kv"><span class="k">段A</span><span class="v">mode=<span class="hl-hit">JSOUP</span> · 步骤: [@css:伪步, attr:text]</span></div><div class="kv"><span class="k">段B</span><span class="v">mode=<span class="hl-hit">JSOUP</span> · 步骤: [pseudo:tag.h3, attr:text]</span></div><div class="kv"><span class="k">语义</span><span class="v">先命中即用；若为 &amp;&amp; 则串联传递（前段输出=后段输入）</span></div>'},
 {t:'URL 模板渲染 {{key}}',ic:'fx',ms:'2ms',body:'<div class="kv"><span class="k">模板</span><span class="v">/search?kw={{key}}&amp;page={{page}}</span></div><div class="kv"><span class="k">key</span><span class="v">"三体"</span><span class="k">page</span><span class="v">1</span></div><div class="kv"><span class="k">输出</span><span class="v hl-ok">/search?kw=三体&amp;page=1</span></div><div class="kv"><span class="k">headers</span><span class="v">UA-Mobile · Referer: baseUrl</span></div>'},
 {t:'发起 HTTP 请求',ic:'req',ms:'380ms',body:'<div class="kv"><span class="k">GET</span><span class="v">https://www.xbiquge.la/search?kw=三体&amp;page=1</span></div><div class="kv"><span class="k">status</span><span class="v hl-ok">200</span><span class="k">charset</span><span class="v">GBK → 自动转 UTF-8</span></div><div class="kv"><span class="k">长度</span><span class="v">128.4 KB</span></div><div class="kv"><span class="k">重试</span><span class="v hl-warn">第1次 UA 被拒 → 换 UA 成功</span></div>'},
 {t:'解析 HTML 文档',ic:'dom',ms:'14ms',body:'<div class="kv"><span class="k">引擎</span><span class="v">cheerio.load(html)</span></div><div class="kv"><span class="k">document</span><span class="v">218 节点 · 31 KB</span></div><div class="kv"><span class="k">诊断</span><span class="v hl-ok">无 iframe 嵌套 · 编码已修正</span></div>'},
 {t:'列表选择 bookList',ic:'list',ms:'6ms',body:'<div class="kv"><span class="k">规则</span><span class="v hl-hit">.result-list &gt; div</span></div><div class="kv"><span class="k">命中</span><span class="v hl-ok">12 个节点（条目）</span></div><div class="kv"><span class="k">前3项</span><span class="v">三体 / 黑暗森林 / 死神永生</span></div>'},
 {t:'字段提取 name',ic:'field',ms:'3ms',body:'<div class="kv"><span class="k">规则</span><span class="v hl-hit">@css:.result-list h3@text</span></div><div class="kv"><span class="k">节点1</span><span class="v hl-ok">"三体"（命中）</span></div><div class="kv"><span class="k">净化</span><span class="v">replaceRegex(/\\s+/g→" ") · trim</span></div><div class="kv"><span class="k">输出</span><span class="v">12/12 全部命中</span></div>'},
 {t:'字段提取 bookUrl',ic:'link',ms:'2ms',body:'<div class="kv"><span class="k">规则</span><span class="v hl-hit">@css:.result-list a@href</span></div><div class="kv"><span class="k">节点1</span><span class="v">/book/1024/ → </span><span class="hl-ok">https://www.xbiquge.la/book/1024/</span></div><div class="kv"><span class="k">处理</span><span class="v">相对路径自动补全（baseUrl 拼接）</span></div><div class="kv"><span class="k">指纹</span><span class="v">id=1024 → 归一化 contentId</span></div>'},
 {t:'聚合归并（引擎外）',ic:'agg',ms:'—',body:'<div class="kv"><span class="k">本源产出</span><span class="v">12 条 → 与其余 23 源相似度归并</span></div><div class="kv"><span class="k">指纹</span><span class="v">normalize(标题)+作者 → 簇#A 命中</span></div><div class="kv"><span class="k">结果</span><span class="v hl-ok">簇#A「三体」挂 4 个可用源</span></div>'}
];
var DBG_MS=[1,2,380,14,6,3,2,0];
var ICONS={
 fx:'<svg viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2"><path d="M4 7h4l3 10h5"/><path d="m14 5 4 4-4 4"/></svg>',
 req:'<svg viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14 0 18-3-4-3-14 0-18z"/></svg>',
 dom:'<svg viewBox="0 0 24 24" fill="none" stroke="#6c7cff" stroke-width="2"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>',
 list:'<svg viewBox="0 0 24 24" fill="none" stroke="#f5c518" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1.5" fill="#f5c518"/><circle cx="3.5" cy="12" r="1.5" fill="#f5c518"/><circle cx="3.5" cy="18" r="1.5" fill="#f5c518"/></svg>',
 field:'<svg viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2"><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
 link:'<svg viewBox="0 0 24 24" fill="none" stroke="#fb923c" stroke-width="2"><path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6L12.5 18"/></svg>',
 agg:'<svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M7 8.2 11 16M17 8.2 13 16M8.5 6h7"/></svg>'
};
var dbgCur=0,dbgTimer=null;
function renderDbg(){
  document.getElementById('dbgSteps').innerHTML=DBG.map(function(s,i){
    var st=i<dbgCur?'done':(i===dbgCur?'run':'');
    var open=i===dbgCur?'open':'';
    return '<div class="step '+st+' '+open+'" onclick="this.classList.toggle(\'open\')">'
      +'<div class="sh"><span class="n">'+('0'+(i+1)).slice(-2)+'</span><span class="ic">'+ICONS[s.ic]+'</span><span class="tt">'+s.t+'</span><span class="ms">'+s.ms+'</span><span class="chev">▶</span></div>'
      +'<div class="sb">'+s.body+'</div></div>';
  }).join('');
  var stEl=document.getElementById('dbgState');
  if(dbgCur===0){stEl.textContent='就绪';stEl.className='tag green'}
  else if(dbgCur>=DBG.length){stEl.textContent='完成 ✓';stEl.className='tag green'}
  else{stEl.textContent='运行中';stEl.className='tag orange'}
  var sum=0;for(var i=0;i<dbgCur&&i<DBG_MS.length;i++)sum+=DBG_MS[i];
  document.getElementById('dbgTime').textContent=sum+'ms';
}
function stepDbg(){
  if(dbgCur<DBG.length){
    dbgCur++;renderDbg();
    var cur=document.querySelector('.step.run');
    if(cur){cur.scrollIntoView({block:'nearest',behavior:'smooth'});if(!cur.classList.contains('open'))cur.classList.add('open')}
    else{var all=document.querySelectorAll('.step.done');if(all.length)all[all.length-1].scrollIntoView({block:'nearest'})}
  }else{toast('执行完毕：8 步 · 总耗时 408ms · 段切分/引擎路由正确')}
}
function resetDbg(){clearInterval(dbgTimer);dbgCur=0;renderDbg()}
document.getElementById('dbgStep').onclick=stepDbg;
document.getElementById('dbgReset').onclick=resetDbg;
document.getElementById('dbgRun').onclick=function(){
  resetDbg();
  dbgTimer=setInterval(function(){if(dbgCur>=DBG.length){clearInterval(dbgTimer);return}stepDbg()},650);
};
renderDbg();

/* ============ 09b 规则工坊：源列表 / 保存 / 导出 ============ */
var ST_SRC=[
  ['legado','笔趣阁·示例源','https://www.xbiquge.la','book'],
  ['legado','轻小说文库','www.linovel.org','book'],
  ['legado','漫画柜','www.manhuagui.com','comic'],
  ['tvbox','量子资源','api.php/provide/vod','video'],
  ['tvbox','卧龙资源','xml.php/provide/vod','video'],
  ['zyplayer','非凡短剧','cj.ffzyapi.com','video'],
  ['hiker','海阔·影视JS','appjs.hikerview.vip','video'],
  ['drpy','drpy·豆瓣','drpy.example.js','video'],
  ['rss','少数派·效率','sspai.com/feed','rss'],
  ['rss','爱范儿','ifanr.com/feed','rss'],
  ['m3u','央视频道表','iptv.example/playlist.m3u','live']
];
var curStSrc=0;
function renderStSrcList(filter){
  filter=filter||'';
  var list=ST_SRC.filter(function(s){return s[1].indexOf(filter)>=0||s[0].indexOf(filter)>=0});
  document.getElementById('stSrcList').innerHTML=list.map(function(s){
    var realIdx=ST_SRC.indexOf(s);
    return '<div class="st-src-item'+(realIdx===curStSrc?' on':'')+'" onclick="loadStSrc('+realIdx+')">'
      +'<span class="st-src-t">'+s[0]+'</span><span class="st-src-n">'+s[1]+'</span></div>';
  }).join('')||'<div style="padding:8px;color:var(--faint);font-size:11px">无匹配的源</div>';
}
function filterStSrc(v){renderStSrcList(v)}
function loadStSrc(idx){
  curStSrc=idx;
  var s=ST_SRC[idx];
  document.getElementById('stSrcType').textContent=s[0];
  document.getElementById('stSrcName').textContent=s[1];
  document.getElementById('stSrcUrl').textContent=s[2];
  var short=s[1].split('·')[0];
  var ds=document.getElementById('dbgSrcName');if(ds)ds.textContent=short;
  renderStSrcList(document.getElementById('stSrcFilter').value);
  toast('已加载源：'+s[1]);
}
function saveRule(){toast('保存规则：'+ST_SRC[curStSrc][1]+' · 写入本地缓存')}
function exportRule(){toast('导出规则：已生成 omniflow-rule-'+ST_SRC[curStSrc][1]+'.json')}
function openStudio(idx){
  if(typeof idx==='number')loadStSrc(idx);
  else{
    document.getElementById('stSrcType').textContent='new';
    document.getElementById('stSrcName').textContent='新建源';
    document.getElementById('stSrcUrl').textContent='https://';
    var ds=document.getElementById('dbgSrcName');if(ds)ds.textContent='新建源';
  }
  go('studio');
}
renderStSrcList('');

/* ============ 10 源管理 ============ */
var SRC=[
 ['文','笔趣阁·书源','tag acc','legado 书源 · bookSourceUrl','https://www.xbiquge.la',98,1,'book','2 分钟前',''],
 ['文','轻小说文库','tag acc','legado 书源 · JSON API 型','www.linovel.org',96,1,'book','5 分钟前',''],
 ['漫','漫画柜','tag acc','legado 漫画源 · type=2','www.manhuagui.com',94,1,'comic','8 分钟前',''],
 ['影','量子资源','tag cy','TVBox sites · CMS(json) type=1','api.php/provide/vod',100,1,'video','1 分钟前',''],
 ['影','卧龙资源','tag cy','TVBox sites · CMS(xml) type=0','xml.php/provide/vod',88,1,'video','6 分钟前',''],
 ['影','非凡短剧','tag cy','ZyPlayer 一键格式 · cms-json','cj.ffzyapi.com',99,1,'video','3 分钟前',''],
 ['影','海阔·影视JS','tag gold','hiker JS 源 · QuickJS 兼容运行','appjs.hikerview.vip',72,1,'video','12 分钟前','tag orange'],
 ['影','drpy·豆瓣','tag gold','drpy XP源 · var rule 对象','drpy.example.js',85,1,'video','15 分钟前',''],
 ['R','少数派·效率','tag gold','RSS 订阅源 · 科技效率','sspai.com/feed',90,1,'rss','20 分钟前',''],
 ['R','爱范儿','tag gold','RSS 订阅源 · 数码资讯','ifanr.com/feed',92,1,'rss','22 分钟前',''],
 ['L','央视频道表','tag green','IPTV · m3u + tvg-id 关联','iptv.example/playlist.m3u',100,1,'live','30 分钟前',''],
 ['L','EPG·节目单','tag green','xmltv EPG 数据源','epg.example/xmltv.xml',100,1,'live','30 分钟前',''],
 ['L','地方卫视','tag green','IPTV · txt 分组格式','live.example/live.txt',92,0,'live','1 小时前','tag red'],
 ['析','JSON解析池A','tag orange','TVBox parses · type=2','jx.example/api',100,1,'parse','4 分钟前','']
];
var srcFilter='all';
function healthColor(v){return v>95?'var(--green)':v>80?'var(--orange)':'var(--red)'}
function renderSrc(){
  var list=SRC.filter(function(s){return srcFilter==='all'||s[7]===srcFilter});
  var box=document.getElementById('srcList');
  if(!list.length){box.innerHTML='<div style="padding:46px;text-align:center;color:var(--muted)">该分类下暂无源</div>';return}
  box.innerHTML=list.map(function(s,i){
    var c=healthColor(s[5]);
    return '<div class="src-row"><div class="si">'+s[0]+'</div>'
      +'<div class="nm"><b>'+s[1]+' <span class="'+s[2]+'">'+s[3]+'</span>'+(s[9]?' <span class="'+s[9]+'">'+(s[9]==='tag red'?'失效':'缓慢')+'</span>':'')+'</b><div class="u">'+s[4]+'</div></div>'
      +'<div class="health"><div class="ht"><span>健康度</span><span style="color:'+c+'">'+s[5]+'%</span></div>'
      +'<div class="bar"><i style="width:'+s[5]+'%;background:'+c+'"></i></div></div>'
      +'<span class="tag" style="width:96px;justify-content:center">'+s[8]+'</span>'
      +'<div class="switch'+(s[6]?' on':'')+'" onclick="this.classList.toggle(\'on\')"></div>'
      +'<div class="src-actions">'
        +'<div class="iconbtn" title="编辑" onclick="editSrc(\''+s[1]+'\')"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.8 9.94l-3.75-3.75L3 17.25zM20.7 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></div>'
        +'<div class="iconbtn" title="删除" onclick="delSrc(\''+s[1]+'\')"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></div>'
      +'</div></div>';
  }).join('');
}
function pickSrcCat(el,cat){
  document.querySelectorAll('.cat-chip[data-srcf]').forEach(function(x){x.classList.remove('on')});
  el.classList.add('on');srcFilter=cat;renderSrc();
}
function editSrc(n){
  var s=SRC.find(function(x){return x[1]===n});
  if(s){
    document.getElementById('stSrcType').textContent=s[7];
    document.getElementById('stSrcName').textContent=s[1];
    document.getElementById('stSrcUrl').textContent=s[4];
    var ds=document.getElementById('dbgSrcName');if(ds)ds.textContent=s[1].split('·')[0];
  }
  go('studio');toast('编辑源：'+n+' → 规则工坊');
}
function delSrc(n){
  SRC=SRC.filter(function(s){return s[1]!==n});
  renderSrc();toast('已删除源：'+n);
}
renderSrc();

/* ============ 11 设置分区切换 ============ */
function pickSetSec(el,sec){
  document.querySelectorAll('.settings-nav-item').forEach(function(x){x.classList.remove('on')});
  el.classList.add('on');
  document.querySelectorAll('.settings-section').forEach(function(x){x.classList.toggle('on',x.id==='sec-'+sec)});
}

/* ============ 导入向导 ============ */
function openImport(){document.getElementById('impModal').classList.add('on')}
function closeImport(){document.getElementById('impModal').classList.remove('on')}
function switchImpTab(el,tab){
  document.querySelectorAll('.imp-tab').forEach(function(x){x.classList.remove('on')});
  el.classList.add('on');
  ['url','file','text'].forEach(function(t){
    document.getElementById('imp-'+t).classList.toggle('on',t===tab);
  });
}
function doImport(){
  closeImport();
  toast('拉取成功 → 识别为 legado 书源数组 · 导入 41 源 · 预检中…');
  setTimeout(function(){toast('预检完成：40 可用 / 1 规则缺失（name 字段为空）')},1800);
}
document.getElementById('impModal').addEventListener('click',function(e){if(e.target===this)closeImport()});

/* ============ 快捷键 ============ */
document.addEventListener('keydown',function(e){
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
    e.preventDefault();go('search');
    var i=document.getElementById('srInput');if(i)i.focus();
  }
  if(e.key==='Escape')closeImport();
  if(SUBVIEWS[currentScreen()]){
    if(e.key==='ArrowRight'&&currentScreen()==='reader')flipPage(1);
    if(e.key==='ArrowLeft'&&currentScreen()==='reader')flipPage(-1);
    if(e.key==='ArrowRight'&&currentScreen()==='comic'){cmPage=Math.min(cmTotal,cmPage+1);renderComic()}
    if(e.key==='ArrowLeft'&&currentScreen()==='comic'){cmPage=Math.max(1,cmPage-1);renderComic()}
  }
});

/* 点击空白处收起下拉 */
document.addEventListener('click',function(){
  document.querySelectorAll('.bs-select.open').forEach(function(s){s.classList.remove('open')});
});
