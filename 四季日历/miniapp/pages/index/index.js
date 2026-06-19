// 四季日历 · 微信小程序
const climate = require('../../utils/climate');
const hexagram = require('../../utils/hexagram');
const lunarInfo = require('../../utils/lunar').lunarInfo;

// ========== 常量 ==========
const TianGan = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const DiZhi = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const Zodiac = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const YI_ITEMS = ['祭祀','祈福','出行','纳采','订盟','嫁娶','开市','交易','安床','修造','入宅','安葬','破土','移徙','动土','求医','入学','沐浴','会友','订婚','拆卸','起基','竖柱','上梁','安门','作灶','安香','开光','求嗣','纳财','纳畜','造仓','出货','酝酿','经络'];
const JI_ITEMS = ['动土','安葬','嫁娶','出行','开市','交易','安床','修造','入宅','移徙','破土','求医','开光','栽种','词讼','伐木','上梁','安门','作灶','赴任','求嗣','纳畜','出货','酝酿','开仓','置产'];
const LUNAR_MONTHS = ['正','二','三','四','五','六','七','八','九','十','冬','腊'];
const LUNAR_DAYS = ['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
const LUNAR_FESTIVALS = { '正月初一':'🧧 春节', '正月十五':'🏮 元宵节', '五月初五':'🐉 端午节', '七月初七':'💫 七夕', '八月十五':'🌕 中秋节', '九月初九':'🍂 重阳节', '腊月三十':'🧨 除夕', '腊月廿九':'🧨 除夕' };
const SOLAR_FESTIVALS = { '01-01':'🎉 元旦', '02-14':'💝 情人节', '03-08':'🌸 妇女节', '04-05':'🌿 清明节', '05-01':'🔧 劳动节', '06-01':'🧒 儿童节', '07-01':'🚩 建党节', '08-01':'⭐ 建军节', '09-10':'📚 教师节', '10-01':'🇨🇳 国庆节', '12-25':'🎄 圣诞节' };

// ========== 农历算法（移植自原项目，基准日 1900-01-31 = 农历 1900-01-01） ==========
function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0); }

function getSolarDayOffset(year, month, day) {
  let days = 0;
  for (let y = 1900; y < year; y++) days += isLeapYear(y) ? 366 : 365;
  const md = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (isLeapYear(year)) md[1] = 29;
  for (let m = 0; m < month; m++) days += md[m];
  days += day;
  days -= 31; // 减去 1900-01-31 的偏移
  return days;
}

function getLunarMonthDays(yearIndex, month) {
  const info = lunarInfo[yearIndex];
  const leapMonth = info & 0xF;
  let bitPos;
  if (month > 12) { bitPos = leapMonth; }
  else if (leapMonth > 0 && month > leapMonth) { bitPos = month; }
  else { bitPos = month - 1; }
  return (info >> 4) & (1 << bitPos) ? 30 : 29;
}

function getLunarYearDays(yearIndex) {
  const info = lunarInfo[yearIndex];
  const leapMonth = info & 0xF;
  let days = 0;
  for (let m = 1; m <= 12; m++) days += getLunarMonthDays(yearIndex, m);
  if (leapMonth > 0) days += getLunarMonthDays(yearIndex, leapMonth + 12);
  return days;
}

function getLunarDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  let offset = getSolarDayOffset(year, month, day);
  if (offset < 0) return { m: month + 1, d: day, leap: false };

  // 确定农历年
  let yi = 0, ly = 1900;
  while (yi < lunarInfo.length) {
    const yd = getLunarYearDays(yi);
    if (offset < yd) break;
    offset -= yd; yi++; ly++;
  }
  if (yi >= lunarInfo.length) return { m: month + 1, d: day, leap: false };

  // 确定农历月
  const info = lunarInfo[yi];
  const leapMonth = info & 0xF;
  let lm = 1, isLeap = false;
  for (let m = 1; m <= 12; m++) {
    const rd = getLunarMonthDays(yi, m);
    if (offset < rd) { lm = m; isLeap = false; break; }
    offset -= rd;
    if (leapMonth === m) {
      const ld = getLunarMonthDays(yi, m + 12);
      if (offset < ld) { lm = m; isLeap = true; break; }
      offset -= ld;
    }
  }
  return { m: lm, d: offset + 1, leap: isLeap, ly: ly };
}

function lunarDayStr(d) { return LUNAR_DAYS[d - 1] || String(d); }
function lunarMonthStr(m, leap) { return (leap ? '闰' : '') + LUNAR_MONTHS[m - 1] + '月'; }

// ========== 黄历 ==========
function prng(a, b) { return ((a * 1103515245 + 12345) & 0x7fffffff) % b; }
function dayGZ(date) {
  const diff = Math.floor((date - new Date(1900, 0, 1)) / 86400000);
  return { gan: TianGan[(diff+6)%10], zhi: DiZhi[diff%12], gi: (diff+6)%10, zi: diff%12 };
}
function yearGZ(year) { return { gan: TianGan[(year-4)%10], zhi: DiZhi[(year-4)%12] }; }
function getHuangli(date) {
  const gz = dayGZ(date); const ygz = yearGZ(date.getFullYear());
  const seed = gz.gi*12 + gz.zi + date.getMonth()*31 + date.getDate();
  const yi=[], ji=[], ys=new Set(), js=new Set();
  for (let i=0;i<2+prng(seed,4);i++) { const x=prng(seed+i*7,YI_ITEMS.length); if(!ys.has(x)){ys.add(x);yi.push(YI_ITEMS[x]);} }
  for (let i=0;i<2+prng(seed+100,3);i++) { const x=prng(seed+200+i*13,JI_ITEMS.length); if(!js.has(x)){js.add(x);ji.push(JI_ITEMS[x]);} }
  const sha=['东','西','南','北','东南','东北','西南','西北'];
  const jsI=['天德','月德','天赦','天喜','天医','福生','母仓','普护','时阳','生气','益后','续世'];
  const xsI=['月破','大耗','劫煞','灾煞','五虚','八风','九空','岁煞','月煞','天刑'];
  return {
    yi: yi.join('、')||'祭祀、祈福', ji: ji.join('、')||'动土、安葬',
    chong: '冲'+Zodiac[(gz.zi+6)%12]+'('+ygz.gan+ygz.zhi+')煞'+sha[prng(seed+50,8)],
    jishen: jsI.slice(prng(seed+30,6),prng(seed+31,4)+2).join('、')||'天德',
    xshen: xsI.slice(prng(seed+40,5),prng(seed+41,3)+2).join('、')||'月破',
    gz: gz.gan+gz.zhi, ygz: ygz.gan+ygz.zhi,
  };
}

// ========== 页面 ==========
Page({
  data: {
    // 日历
    bannerBg: 'linear-gradient(135deg, #f39c12, #f1c40f)',
    climateIcon: '🌾', seasonName: '初夏', climateDesc: '华北平原 · 麦浪金黄', climateSubtitle: '气温渐高',
    monthYearTitle: '', days: [], selectedDate: '', selectedDateLabel: '点击日期',
    // 事件
    eventInput: '', eventList: [],
    // 黄历
    showHuangli: false, hlData: {}, hlParticles: [],
    // 卜卦
    showDivination: false, divStep: 'wish', wishText: '',
    bucketBusy: false, bucketShaking: false, flyingStick: null, clickRemaining: 6, yaoLines: [], hexResult: null,
    showExplain: false, explainPrompt: '', explainHint: '',
    // 天气
    weatherIcons: {}, weatherSummary: '', showWeather: true,
    // 城市
    locationName: '北京', regionName: '华北', showCityPicker: false, citySearch: '', cityResults: [],
  },

  currentDate: null,
  events: {},
  divState: null,

  onLoad() {
    this.currentDate = new Date();
    try { this.loadEvents(); } catch(e) {}
    this.renderCalendar();
    this.autoLocation();
  },

  onShow() {
    if (!this.data.days.length && this.currentDate) this.renderCalendar();
  },

  loadEvents() { try { const s = wx.getStorageSync('calendar-events'); if (s) this.events = JSON.parse(s); } catch(e) {} },
  saveEvents() { try { wx.setStorageSync('calendar-events', JSON.stringify(this.events)); } catch(e) {} },

  renderCalendar() {
    const y = this.currentDate.getFullYear();
    const m = this.currentDate.getMonth();
    const today = new Date(); const todayStr = this.fmt(today);
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    const prevLast = new Date(y, m, 0);
    const startDow = firstDay.getDay();
    const cc = climate.getClimate(m);

    const days = [];
    for (let i = startDow - 1; i >= 0; i--) days.push(this.bd(y, m-1, prevLast.getDate()-i, today, todayStr, true));
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(this.bd(y, m, d, today, todayStr, false));
    const rem = 7 - (days.length % 7);
    if (rem < 7) for (let d = 1; d <= rem; d++) days.push(this.bd(y, m+1, d, today, todayStr, true));

    const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    const suffix = cc.desc.includes('·') ? cc.desc.split('·').pop().trim() : cc.desc;
    const desc = this.data.regionName + ' · ' + suffix;

    this.setData({
      monthYearTitle: y + '年 ' + months[m],
      bannerBg: cc.bannerBg, climateIcon: cc.icon,
      seasonName: cc.seasonName, climateDesc: desc, climateSubtitle: cc.subtitle,
      todayBg: cc.todayBg, days: days,
      showWeather: y === new Date().getFullYear() && m === new Date().getMonth(),
    });
  },

  bd(year, month, day, today, todayStr, other) {
    const d = new Date(year, month, day); const ds = this.fmt(d);
    const isToday = ds === todayStr; const isSel = ds === this.data.selectedDate;
    const ld = getLunarDate(d);
    // 初一显示月份名（如"正月"），其余显示日期（如"初二"）
    const lds = (ld.d === 1) ? lunarMonthStr(ld.m, ld.leap) : lunarDayStr(ld.d);
    const isLunarFirst = ld.d === 1;
    let h = ''; const lf = lunarMonthStr(ld.m, ld.leap) + lunarDayStr(ld.d);
    if (LUNAR_FESTIVALS[lf]) h = LUNAR_FESTIVALS[lf];
    const sk = String(month+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
    if (!h && SOLAR_FESTIVALS[sk]) h = SOLAR_FESTIVALS[sk];
    const evts = this.events[ds] || [];
    const wIcon = this.data.weatherIcons[ds] || '';
    return {
      dateStr: ds, day, isOther: other, isToday, isSel,
      lunar: lds, lunarFirst: isLunarFirst, lunarLeap: ld.leap,
      holiday: h, hasEvent: evts.length > 0, weather: wIcon,
    };
  },

  fmt(d) { return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); },

  prevMonth() { this.currentDate.setMonth(this.currentDate.getMonth()-1); this.renderCalendar(); },
  nextMonth() { this.currentDate.setMonth(this.currentDate.getMonth()+1); this.renderCalendar(); },
  goToToday() { this.currentDate = new Date(); this.setData({ showWeather: true }); this.renderCalendar(); },

  // 日期点击 → 黄历
  onDayClick(e) {
    const ds = e.currentTarget.dataset.date;
    const [y,m,d] = ds.split('-').map(Number);
    const date = new Date(y,m-1,d); const ld = getLunarDate(date); const hl = getHuangli(date);
    const wk = ['日','一','二','三','四','五','六'];
    const lf = lunarMonthStr(ld.m, ld.leap) + lunarDayStr(ld.d);

    // 检测节日主题
    const sk = String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    const lunarFull = lunarMonthStr(ld.m, ld.leap) + lunarDayStr(ld.d);
    const holiday = LUNAR_FESTIVALS[lunarFull] || SOLAR_FESTIVALS[sk] || '';
    let theme = 'default', particles = [];
    if (holiday.includes('春节') || holiday.includes('除夕')) theme = 'spring';
    else if (holiday.includes('元宵')) theme = 'yuanxiao';
    else if (holiday.includes('七夕')) theme = 'qixi';
    else if (holiday.includes('中秋')) theme = 'midautumn';
    else if (holiday.includes('端午')) theme = 'dragonboat';
    else if (holiday.includes('重阳')) theme = 'chongyang';
    else if (holiday.includes('清明')) theme = 'qingming';
    else if (holiday.includes('国庆')) theme = 'guoqing';
    else if (holiday.includes('圣诞')) theme = 'christmas';
    else if (holiday.includes('元旦')) theme = 'newyear';
    else if (holiday.includes('情人')) theme = 'valentine';
    else if (holiday.includes('妇女')) theme = 'women';
    else if (holiday.includes('劳动')) theme = 'labour';
    else if (holiday.includes('儿童')) theme = 'children';
    else if (holiday.includes('建党')) theme = 'party';
    else if (holiday.includes('建军')) theme = 'army';
    else if (holiday.includes('教师')) theme = 'teacher';

    // 生成粒子
    if (theme !== 'default') {
      for (let i = 0; i < 12; i++) {
        particles.push({
          i, x: Math.floor(Math.random()*90)+5, y: Math.floor(Math.random()*70)+5,
          d: (Math.random()*2).toFixed(2), dx: Math.floor(Math.random()*60)-30,
          dy: Math.floor(Math.random()*40)-80, s: Math.floor(Math.random()*8)+8,
        });
      }
    }

    // 播放节日音效
    if (theme !== 'default') this.playFestivalSound(theme);

    const todayStr = this.fmt(new Date());
    this.setData({
      selectedDate: ds, selectedDateLabel: m+'月'+d+'日', showHuangli: true,
      showWeather: ds === todayStr,
      hlParticles: particles,
      hlData: {
        solar: y+'年'+m+'月'+d+'日 星期'+wk[date.getDay()],
        lunar: '农历 '+hl.ygz+'年 '+lf, ganzhi: '干支 '+hl.gz+'日',
        yi: hl.yi, ji: hl.ji, chong: hl.chong, jishen: hl.jishen, xshen: hl.xshen,
        theme: theme,
      },
    });
    this.renderCalendar();
    this.setData({ eventList: this.events[ds] || [] });
  },
  closeHuangli() { this.setData({ showHuangli: false }); },

  // 事件
  onEventInput(e) { this.setData({ eventInput: e.detail.value }); },
  addEvent() {
    const t = this.data.eventInput.trim(), ds = this.data.selectedDate;
    if (!t || !ds) return;
    if (!this.events[ds]) this.events[ds] = [];
    this.events[ds].push({ id: Date.now(), text: t });
    this.saveEvents(); this.setData({ eventInput: '', eventList: this.events[ds] }); this.renderCalendar();
  },
  deleteEvent(e) {
    const ds = this.data.selectedDate;
    if (!ds || !this.events[ds]) return;
    this.events[ds] = this.events[ds].filter(ev => ev.id !== e.currentTarget.dataset.id);
    this.saveEvents(); this.setData({ eventList: this.events[ds] }); this.renderCalendar();
  },

  // 卜卦
  openDivination() {
    const lines = []; for (let i=0;i<6;i++) lines.push({ pending: true });
    this.divState = { active: true, lines: new Array(6).fill(0), c: 0, wish: '', result: null };
    this.setData({ showDivination: true, divStep: 'wish', wishText: '', clickRemaining: 6, yaoLines: lines, hexResult: null, showExplain: false });
  },
  closeDivination() { this.setData({ showDivination: false }); },
  onWishInput(e) { this.setData({ wishText: e.detail.value }); },
  startShaking() { this.divState.wish = this.data.wishText.trim(); this.setData({ divStep: 'shake' }); },
  retryDivination() {
    const lines = []; for (let i=0;i<6;i++) lines.push({ pending: true });
    this.divState = { active: true, lines: new Array(6).fill(0), c: 0, wish: '', result: null };
    this.setData({ divStep: 'wish', wishText: '', clickRemaining: 6, yaoLines: lines, hexResult: null, showExplain: false });
  },

  shakeBucket() {
    const st = this.divState;
    if (!st || st.c >= 6 || this.data.bucketBusy) return;
    // 开始摇动动画
    this.setData({ bucketBusy: true, bucketShaking: true });
    // 飞签效果
    const flyX = 30 + Math.floor(Math.random() * 40);
    const flyY = 5 + Math.floor(Math.random() * 10);
    this.setData({ flyingStick: { x: flyX, y: flyY } });
    setTimeout(() => {
      this.setData({ flyingStick: null, bucketShaking: false });
      const v = hexagram.tossCoins(); st.lines[st.c] = v; st.c++;
      const lines = [];
      for (let i=5;i>=0;i--) {
        if (i<6-st.c) lines.push({ pending: true });
        else { const x=st.lines[i]; lines.push({ pending:false, type:(x===7||x===9)?'yang':'yin', changing:x===6||x===9 }); }
      }
      this.setData({ yaoLines: lines, clickRemaining: 6-st.c, bucketBusy: false });
      if (st.c >= 6) setTimeout(() => this.showResult(), 500);
    }, 800);
  },

  showResult() {
    const st = this.divState;
    const pat = hexagram.getPattern(st.lines);
    const hx = hexagram.hexagramByPattern[pat];
    if (!hx) { wx.showToast({ title: '卦象匹配错误', icon: 'none' }); return; }
    let cp = pat, hc = false; const cl = [];
    for (let i=0;i<6;i++) { if (st.lines[i]===6||st.lines[i]===9) { hc=true; cl.push(i); cp^=(1<<i); } }
    const chx = hc ? hexagram.hexagramByPattern[cp] : null;
    const pos = ['初','二','三','四','五','上'];
    let ci = '', cip = '';
    if (hc && cl.length) {
      ci = '变爻：'+cl.map(i=>pos[i]+'爻').join('、')+' → 之卦 '+(chx?chx.name:'—');
      if (chx && chx!==hx) cip = '🔄 之卦 '+chx.name+'：'+chx.interp+'\n（变爻指示事物发展方向）';
    }
    this.setData({ hexResult: { num:hx.num, name:hx.name, judgment:hx.judgment, interp:'📖 卦辞解读：\n'+hx.interp, changingInfo:ci, changedInterp:cip } });
    st.result = { hex: hx, changedHex: chx, hasChanging: hc, changingLines: cl, posNames: pos };
    // 自动展开 AI 详解
    this.autoExplain();
  },

  autoExplain() {
    const wish = this.divState.wish || '（未填写）';
    const res = this.divState.result; if (!res) return;
    const { hex: hx, changedHex: chx, hasChanging, changingLines: cl, posNames: pos } = res;
    let p = '请帮我详细解读以下六爻卦象：\n\n🙏 心有所想：'+wish+'\n\n📖 本卦：第'+hx.num+'卦 '+hx.name+'（上'+hx.upper+'下'+hx.lower+'）\n彖曰：'+hx.judgment+'\n卦辞：'+hx.interp+'\n';
    if (hasChanging && cl.length) {
      p += '\n🔄 变爻：'+cl.map(i=>pos[i]+'爻').join('、')+'\n';
      if (chx && chx!==hx) p += '之卦：第'+chx.num+'卦 '+chx.name+'\n之卦卦辞：'+chx.interp+'\n';
    }
    p += '\n请从以下角度解读：\n1. 本卦的核心含义\n2. 结合我所求之事，分析吉凶趋势\n';
    if (hasChanging) p += '3. 变爻的指示意义和之卦的发展方向\n4. 综合建议\n'; else p += '3. 针对性的行动建议\n';
    this.setData({ showExplain: true, explainPrompt: p, explainHint: '👆 点击复制 → 选择AI → 粘贴发送' });
  },

  toggleExplain() {
    if (this.data.showExplain) { this.setData({ showExplain: false }); return; }
    const wish = this.divState.wish || '（未填写）';
    const res = this.divState.result; if (!res) return;
    const { hex: hx, changedHex: chx, hasChanging, changingLines: cl, posNames: pos } = res;
    let p = '请帮我详细解读以下六爻卦象：\n\n🙏 心有所想：'+wish+'\n\n📖 本卦：第'+hx.num+'卦 '+hx.name+'（上'+hx.upper+'下'+hx.lower+'）\n彖曰：'+hx.judgment+'\n卦辞：'+hx.interp+'\n';
    if (hasChanging && cl.length) {
      p += '\n🔄 变爻：'+cl.map(i=>pos[i]+'爻').join('、')+'\n';
      if (chx && chx!==hx) p += '之卦：第'+chx.num+'卦 '+chx.name+'\n之卦卦辞：'+chx.interp+'\n';
    }
    p += '\n请从以下角度解读：\n1. 本卦的核心含义\n2. 结合我所求之事，分析吉凶趋势\n';
    if (hasChanging) p += '3. 变爻的指示意义和之卦的发展方向\n4. 综合建议\n'; else p += '3. 针对性的行动建议\n';
    this.setData({ showExplain: true, explainPrompt: p, explainHint: '👆 点击复制 → 选择AI → 粘贴发送' });
  },

  copyExplainText() {
    wx.setClipboardData({ data: this.data.explainPrompt, success: () => {
      this.setData({ explainHint: '✅ 已复制！选择AI服务，粘贴发送' });
      setTimeout(() => this.setData({ explainHint: '👆 点击复制 → 选择AI → 粘贴发送' }), 3000);
    }});
  },

  openService(e) {
    const name = e.currentTarget.dataset.name || '';
    wx.setClipboardData({
      data: this.data.explainPrompt,
      success: () => {
        wx.showModal({
          title: '已复制解读文案',
          content: '请打开手机浏览器访问 ' + name + '，粘贴发送即可',
          showCancel: false,
          confirmText: '知道了',
        });
      },
    });
  },

  // ========== 音效 ==========
  playFestivalSound(theme) {
    try {
      const ctx = wx.createWebAudioContext();
      if (!ctx) { this._vibrate(theme); return; }
      let freq = 800, dur = 180;
      if (theme === 'spring' || theme === 'guoqing') { freq = 1200; dur = 100; }
      else if (theme === 'yuanxiao' || theme === 'midautumn') { freq = 600; dur = 300; }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = (theme === 'spring' || theme === 'guoqing') ? 'square' : 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur / 1000);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + dur / 1000 + 0.05);

      if (theme === 'spring' || theme === 'guoqing') {
        for (let i = 0; i < 12; i++) {
          const t = ctx.currentTime + i * 0.07;
          const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
          o2.type = 'sawtooth';
          o2.frequency.value = 200 + Math.random() * 1800;
          g2.gain.setValueAtTime(0.5, t);
          g2.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
          o2.connect(g2); g2.connect(ctx.destination);
          const o3 = ctx.createOscillator(); const g3 = ctx.createGain();
          o3.type = 'square';
          o3.frequency.value = 80 + Math.random() * 120;
          g3.gain.setValueAtTime(0.4, t);
          g3.gain.exponentialRampToValueAtTime(0.01, t + 0.04);
          o3.connect(g3); g3.connect(ctx.destination);
          o2.start(t); o2.stop(t + 0.06);
          o3.start(t); o3.stop(t + 0.05);
        }
      }
    } catch(e) { this._vibrate(theme); }
  },

  _vibrate(theme) {
    if (theme === 'spring' || theme === 'guoqing') {
      for (let i = 0; i < 3; i++) setTimeout(() => wx.vibrateShort({ type: 'heavy' }), i * 100);
    } else {
      wx.vibrateShort({ type: 'light' });
    }
  },

  // ========== 定位与城市 ==========
  autoLocation() {
    // 先用缓存的位置
    const cached = wx.getStorageSync('userLocation');
    if (cached && cached.name) {
      this.setData({ locationName: cached.name, regionName: cached.region || cached.name });
      const app = getApp();
      if (app && app.globalData) {
        app.globalData.latitude = cached.latitude;
        app.globalData.longitude = cached.longitude;
        app.globalData.locationName = cached.name;
        app.globalData.climateZoneName = cached.region || cached.name;
      }
      this.fetchWeather();
    }
    // 然后尝试 GPS 精确定位
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        wx.request({
          url: 'https://api.bigdatacloud.net/data/reverse-geocode-client',
          data: { latitude: res.latitude, longitude: res.longitude, localityLanguage: 'zh' },
          timeout: 8000,
          success: (geo) => {
            const d = geo.data || {};
            const name = d.city || d.locality || '定位城市';
            const region = d.principalSubdivision || d.admin1 || name;
            if (name !== this.data.locationName) {
              this.updateLocation(res.latitude, res.longitude, name, region, true);
            }
          },
        });
      },
    });
  },
  openCityPicker() { this.setData({ showCityPicker: true, citySearch: '', cityResults: [] }); },
  closeCityPicker() { this.setData({ showCityPicker: false }); },
  onCitySearchInput(e) { this.setData({ citySearch: e.detail.value }); },

  doCitySearch() {
    const q = this.data.citySearch.trim();
    if (!q) return;
    wx.request({
      url: 'https://geocoding-api.open-meteo.com/v1/search',
      data: { name: q, count: 10, language: 'zh', format: 'json' },
      timeout: 8000,
      success: (res) => {
        const results = (res.data.results || []).map((r, i) => ({
          id: i, name: r.name || q, region: r.admin1 || r.country || '', country: r.country || '',
          lat: r.latitude, lon: r.longitude,
        }));
        this.setData({ cityResults: results });
      },
      fail: () => wx.showToast({ title: '搜索失败', icon: 'none' }),
    });
  },

  selectCity(e) {
    const city = this.data.cityResults[e.currentTarget.dataset.idx];
    if (!city) return;
    this.updateLocation(city.lat, city.lon, city.name, city.region);
    this.closeCityPicker();
  },

  useGPS() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        wx.request({
          url: 'https://api.bigdatacloud.net/data/reverse-geocode-client',
          data: { latitude: res.latitude, longitude: res.longitude, localityLanguage: 'zh' },
          timeout: 8000,
          success: (geo) => {
            const name = (geo.data && (geo.data.city || geo.data.locality)) || '定位城市';
            this.updateLocation(res.latitude, res.longitude, name);
            this.closeCityPicker();
          },
          fail: () => {
            this.updateLocation(res.latitude, res.longitude, '已定位', '未知区域');
            this.closeCityPicker();
          },
        });
      },
      fail: () => {
        wx.showModal({
          title: '定位失败',
          content: '请在设置中开启位置权限',
          showCancel: false,
        });
      },
    });
  },

  updateLocation(lat, lon, name, region, quiet) {
    const regionName = region || name;
    const app = getApp();
    if (app && app.globalData) {
      app.globalData.latitude = lat;
      app.globalData.longitude = lon;
      app.globalData.locationName = name;
      app.globalData.climateZoneName = regionName;
    }
    wx.setStorageSync('userLocation', { latitude: lat, longitude: lon, name, region: regionName });
    this.setData({ locationName: name, regionName: regionName });
    this.fetchWeather();
    if (!quiet) wx.showToast({ title: '已切换到 ' + name, icon: 'none' });
  },

  // ========== 天气 ==========
  fetchWeather() {
    let lat = 39.9, lon = 116.4;
    try {
      const app = getApp();
      if (app && app.globalData) {
        lat = app.globalData.latitude || lat;
        lon = app.globalData.longitude || lon;
      }
    } catch(e) {}
    wx.request({
      url: 'https://api.open-meteo.com/v1/forecast',
      data: {
        latitude: lat,
        longitude: lon,
        daily: 'weathercode,temperature_2m_max,temperature_2m_min',
        timezone: 'Asia/Shanghai',
        forecast_days: 16,
      },
      timeout: 10000,
      success: (res) => {
        if (!res.data || !res.data.daily) return;
        const daily = res.data.daily;
        const codes = {
          0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️', 45:'🌫️', 48:'🌫️',
          51:'🌦️', 53:'🌦️', 55:'🌦️', 61:'🌧️', 63:'🌧️', 65:'🌧️',
          71:'❄️', 73:'❄️', 75:'❄️', 77:'🌨️',
          80:'🌧️', 81:'🌧️', 82:'🌧️', 85:'🌨️', 86:'🌨️',
          95:'⛈️', 96:'⛈️', 99:'⛈️'
        };
        const icons = {};
        for (let i = 0; i < daily.time.length; i++) {
          const code = daily.weathercode[i];
          icons[daily.time[i]] = codes[code] || '🌤️';
        }
        const today = daily.time[0];
        const hi = Math.round(daily.temperature_2m_max[0]);
        const lo = Math.round(daily.temperature_2m_min[0]);
        this.setData({
          weatherIcons: icons,
          weatherSummary: (icons[today]||'') + ' ' + lo + '~' + hi + '°C',
        });
        this.renderCalendar();
      },
      fail: () => {}
    });
  },

  nop() {},
});
