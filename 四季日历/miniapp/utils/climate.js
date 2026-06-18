// 华北平原12月气候数据
const monthClimate = [
            { // 0 - 1月 隆冬
                season: '❄️ 冬季 · 隆冬',
                icon: '🌨️',
                seasonName: '隆冬',
                desc: '华北平原 · 冰天雪地',
                subtitle: '寒冷干燥，北风凛冽，偶有降雪',
                bodyBg: 'linear-gradient(135deg, #2c3e50 0%, #4a6fa5 30%, #b8c9e0 70%, #e8eef5 100%)',
                bannerBg: 'linear-gradient(135deg, #3a6186, #4b6cb7)',
                accentColor: '#3a6186',
                todayBg: '#3a6186',
                particles: 'snow'
            },
            { // 1 - 2月 晚冬
                season: '❄️ 冬季 · 晚冬',
                icon: '🌬️',
                seasonName: '晚冬',
                desc: '华北平原 · 春寒料峭',
                subtitle: '气温缓慢回升，仍有寒潮侵袭',
                bodyBg: 'linear-gradient(135deg, #5a7a9a 0%, #8faac7 40%, #c5d5e8 70%, #f0f3f8 100%)',
                bannerBg: 'linear-gradient(135deg, #5b86b4, #7ba3cc)',
                accentColor: '#5b86b4',
                todayBg: '#5b86b4',
                particles: 'snow'
            },
            { // 2 - 3月 初春
                season: '🌱 春季 · 初春',
                icon: '🌱',
                seasonName: '初春',
                desc: '华北平原 · 万物复苏',
                subtitle: '冰雪消融，草木萌发，偶有沙尘',
                bodyBg: 'linear-gradient(135deg, #c9b896 0%, #b5c9a0 30%, #c8e6c9 60%, #e8f5e9 100%)',
                bannerBg: 'linear-gradient(135deg, #7a9a5b, #9bba7c)',
                accentColor: '#7a9a5b',
                todayBg: '#7a9a5b',
                particles: 'none'
            },
            { // 3 - 4月 仲春
                season: '🌸 春季 · 仲春',
                icon: '🌸',
                seasonName: '仲春',
                desc: '华北平原 · 百花齐放',
                subtitle: '温暖宜人，桃李盛开，春雨绵绵',
                bodyBg: 'linear-gradient(135deg, #f8d3d3 0%, #f7c5cc 25%, #d4e7c5 55%, #e8f5e9 100%)',
                bannerBg: 'linear-gradient(135deg, #e895a9, #f0b8c5)',
                accentColor: '#d4788f',
                todayBg: '#d4788f',
                particles: 'petal'
            },
            { // 4 - 5月 晚春
                season: '🌿 春季 · 晚春',
                icon: '🌿',
                seasonName: '晚春',
                desc: '华北平原 · 绿意盎然',
                subtitle: '日照增长，气温升高，万物繁茂',
                bodyBg: 'linear-gradient(135deg, #a8d8a8 0%, #6db86d 20%, #c8e6c9 55%, #fff9c4 100%)',
                bannerBg: 'linear-gradient(135deg, #4caf50, #66bb6a)',
                accentColor: '#388e3c',
                todayBg: '#388e3c',
                particles: 'petal'
            },
            { // 5 - 6月 初夏
                season: '☀️ 夏季 · 初夏',
                icon: '🌾',
                seasonName: '初夏',
                desc: '华北平原 · 麦浪金黄',
                subtitle: '气温渐高，偶有雷阵雨，小麦成熟',
                bodyBg: 'linear-gradient(135deg, #87CEEB 0%, #f9e076 30%, #fff8dc 60%, #e8f5e9 100%)',
                bannerBg: 'linear-gradient(135deg, #f39c12, #f1c40f)',
                accentColor: '#e67e22',
                todayBg: '#e67e22',
                particles: 'none'
            },
            { // 6 - 7月 盛夏
                season: '🌧️ 夏季 · 盛夏',
                icon: '⛈️',
                seasonName: '盛夏',
                desc: '华北平原 · 雨季绵绵',
                subtitle: '高温多雨，闷热潮湿，暴雨频繁',
                bodyBg: 'linear-gradient(135deg, #4a6fa5 0%, #2c6e91 25%, #5588aa 50%, #c5dde8 100%)',
                bannerBg: 'linear-gradient(135deg, #2c6e91, #3498db)',
                accentColor: '#2c6e91',
                todayBg: '#2c6e91',
                particles: 'rain'
            },
            { // 7 - 8月 晚夏
                season: '🔥 夏季 · 晚夏',
                icon: '🔥',
                seasonName: '晚夏',
                desc: '华北平原 · 骄阳似火',
                subtitle: '酷暑难耐，闷热至极，偶有暴雨',
                bodyBg: 'linear-gradient(135deg, #e74c3c 0%, #f39c12 30%, #ff6b35 55%, #ffd89b 100%)',
                bannerBg: 'linear-gradient(135deg, #e74c3c, #f39c12)',
                accentColor: '#c0392b',
                todayBg: '#c0392b',
                particles: 'none'
            },
            { // 8 - 9月 初秋
                season: '🍂 秋季 · 初秋',
                icon: '🍂',
                seasonName: '初秋',
                desc: '华北平原 · 天高云淡',
                subtitle: '暑气渐消，秋高气爽，天空湛蓝',
                bodyBg: 'linear-gradient(135deg, #5dade2 0%, #85c1e9 25%, #fad7a1 60%, #fef9e7 100%)',
                bannerBg: 'linear-gradient(135deg, #e8a440, #f0c060)',
                accentColor: '#c6822a',
                todayBg: '#c6822a',
                particles: 'leaf'
            },
            { // 9 - 10月 深秋
                season: '🍁 秋季 · 深秋',
                icon: '🍁',
                seasonName: '深秋',
                desc: '华北平原 · 层林尽染',
                subtitle: '秋叶金黄，凉爽舒适，丰收时节',
                bodyBg: 'linear-gradient(135deg, #e67e22 0%, #d35400 25%, #f39c12 50%, #ffeaa7 100%)',
                bannerBg: 'linear-gradient(135deg, #d35400, #e67e22)',
                accentColor: '#a04000',
                todayBg: '#a04000',
                particles: 'leaf'
            },
            { // 10 - 11月 晚秋
                season: '🌫️ 秋季 · 晚秋',
                icon: '🌫️',
                seasonName: '晚秋',
                desc: '华北平原 · 落叶纷飞',
                subtitle: '寒风渐起，草木凋零，偶有霜冻',
                bodyBg: 'linear-gradient(135deg, #8d7b6a 0%, #a89880 25%, #c4b8a8 55%, #e8e0d5 100%)',
                bannerBg: 'linear-gradient(135deg, #7d6b5a, #9b8b7a)',
                accentColor: '#6b5b4a',
                todayBg: '#6b5b4a',
                particles: 'leaf'
            },
            { // 11 - 12月 初冬
                season: '⛄ 冬季 · 初冬',
                icon: '🌫️',
                seasonName: '初冬',
                desc: '华北平原 · 寒风渐起',
                subtitle: '气温骤降，北风呼啸，初雪将至',
                bodyBg: 'linear-gradient(135deg, #5d6d7e 0%, #85929e 30%, #b0bec5 55%, #e0e5e8 100%)',
                bannerBg: 'linear-gradient(135deg, #546e7a, #78909c)',
                accentColor: '#455a64',
                todayBg: '#455a64',
                particles: 'snow'
            },
        ];

function getClimate(monthIndex) {
  return monthClimate[monthIndex];
}
module.exports = { monthClimate, getClimate };
