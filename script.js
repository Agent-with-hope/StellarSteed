// --- 安全配置：API 密钥现在由后端 api/chat.js 处理，前端不再保留密钥 ---
// 请确保你已在 Vercel 环境变量中配置了 ZHIPU_API_KEY

// --- 3D 漫天孔明灯模拟 (精细化 LatheGeometry) ---
const initThreeJS = () => {
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f0514, 0.006); 

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 10, 60);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 1. 背景星火
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPos = new Float32Array(starCount * 3);
    for(let i=0; i<starCount*3; i++) {
        starPos[i] = (Math.random() - 0.5) * 300;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
        color: 0xffaa00, size: 0.4, transparent: true, opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    scene.add(new THREE.AmbientLight(0x2a1040, 0.8));
    
    // 2. 纸灯笼模型
    const points = [];
    for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const radius = 0.5 + Math.sin(t * Math.PI) * 0.6 + (t * 0.2); 
        points.push(new THREE.Vector2(radius, t * 2.5 - 1.25));
    }
    const lanternGeo = new THREE.LatheGeometry(points, 16);
    
    const lanternMat = new THREE.MeshStandardMaterial({ 
        color: 0xff3300, 
        emissive: 0xff2200,     
        emissiveIntensity: 0.6,
        transparent: true, 
        opacity: 0.85,
        roughness: 1.0,         
        side: THREE.DoubleSide  
    });

    const flameGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); 

    const lanterns = [];
    const lanternGroup = new THREE.Group();
    scene.add(lanternGroup);

    for(let i=0; i<80; i++) {
        const lanternObj = new THREE.Group();
        const shell = new THREE.Mesh(lanternGeo, lanternMat.clone());
        const flame = new THREE.Mesh(flameGeo, flameMat);
        flame.position.y = -0.8; 
        
        if (i % 6 === 0) {
            const light = new THREE.PointLight(0xffaa00, 1.5, 20);
            light.position.y = -0.8;
            lanternObj.add(light);
        }

        lanternObj.add(shell);
        lanternObj.add(flame);

        lanternObj.position.x = (Math.random() - 0.5) * 200;
        lanternObj.position.y = (Math.random() - 0.5) * 150 - 60; 
        lanternObj.position.z = (Math.random() - 0.5) * 150 - 20;

        const scale = Math.random() * 0.6 + 0.6;
        lanternObj.scale.set(scale, scale, scale);
        
        lanternObj.userData = {
            speedY: Math.random() * 0.04 + 0.02, 
            swayFreqX: Math.random() * 0.01 + 0.005, 
            swayFreqZ: Math.random() * 0.01 + 0.005, 
            swayAmp: Math.random() * 0.08, 
            initialX: lanternObj.position.x,
            initialZ: lanternObj.position.z,
            rotSpeedY: (Math.random() - 0.5) * 0.005, 
            flickerSpeed: Math.random() * 5 + 5, 
            flickerOffset: Math.random() * Math.PI * 2,
            matRef: shell.material 
        };

        lanternGroup.add(lanternObj);
        lanterns.push(lanternObj);
    }

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth/2) * 0.02;
        mouseY = (e.clientY - window.innerHeight/2) * 0.02;
    });

    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        stars.position.y += 0.015;
        if(stars.position.y > 100) stars.position.y = -100;

        lanterns.forEach(l => {
            const data = l.userData;
            l.position.y += data.speedY;
            l.position.x = data.initialX + Math.sin(time * data.swayFreqX * 100) * data.swayAmp * 100;
            l.position.z = data.initialZ + Math.cos(time * data.swayFreqZ * 100) * data.swayAmp * 50;
            l.rotation.z = Math.sin(time * data.swayFreqX * 100) * 0.1;
            l.rotation.x = Math.cos(time * data.swayFreqZ * 100) * 0.1;
            l.rotation.y += data.rotSpeedY;
            const flicker = (Math.sin(time * data.flickerSpeed + data.flickerOffset) + 1) / 2; 
            data.matRef.emissiveIntensity = 0.4 + flicker * 0.4; 
            
            if (l.position.y > 100) {
                l.position.y = -80;
                l.position.x = (Math.random() - 0.5) * 200;
                data.initialX = l.position.x;
            }
        });

        camera.position.x += (mouseX - camera.position.x) * 0.03;
        camera.position.y += (-mouseY + 10 - camera.position.y) * 0.03;
        camera.lookAt(0, 20, 0);

        renderer.render(scene, camera);
    };
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

// --- 文案数据 ---
const wishesData = {
    'career': { 
        title: '💼 事业起飞 (禁止画饼)', 
        intro: '未来的互联网巨头/行业大佬，你的福气在后头！', 
        points: [
            { title: '左手干翻KPI', text: '祝你新的一年灵感如泉涌，PPT一稿过，代码无Bug，方案让老板看了直呼内行。' }, 
            { title: '拒绝精神内耗', text: '遇到傻X客户或同事，心里默念“吗喽的命也是命”，绝不内耗自己！该下班下班，不当牛马。' }, 
            { title: '升职加薪大步走', text: '别人卷生卷死，你躺赢带薪。搞钱才是硬道理，智者不入爱河，寡王一路硕博/暴富！' }
        ], 
        activity: '<strong>来自基友的嘱托：</strong> 苟富贵，勿相忘。发达了记得立刻把公司的保洁大位留给我！' 
    },
    'health': { 
        title: '🧘 脆皮保卫战 (养生高端局)', 
        intro: '作为确诊为“脆皮”的现代人，没有好身体怎么去花赚来的几个亿？', 
        points: [
            { title: '发际线永不后退', text: '祝你马年头发浓密，根根坚挺！告别熬夜修仙，保温杯里泡枸杞安排上。' }, 
            { title: '提供稳定情绪价值', text: '愿你每天精神状态美丽，不发疯不破防。如果实在绷不住了，随时Call我，我陪你一起大小癫。' }, 
            { title: '告别容貌焦虑', text: '记住，在我心里你永远是原相机直出都好看的俊男/靓女。自信放光芒！' }
        ], 
        activity: '<strong>来自基友的嘱托：</strong> 别总吃垃圾食品了，今天早点睡，听到没！' 
    },
    'wealth': { 
        title: '💰 泼天富贵 (科学算命与玄学)', 
        intro: '比起虚无缥缈的浪漫，我更祝你实在的暴富。', 
        points: [
            { title: '财神强行喂饭', text: '愿你出门踩到金矿，买基金全线飘红，抽盲盒必中隐藏款，每天被钱砸醒！' }, 
            { title: '锦鲤超强护体', text: '转发这条赛博锦鲤（就是我），马年水逆统统退散，小人自动屏蔽，出门必遇贵人！' }, 
            { title: '共同富裕计划', text: '俗话说的好，你暴富了，我就是富豪最好的朋友，四舍五入等于我暴富了。稳赚不赔！' }
        ], 
        activity: '<strong>来自基友的嘱托：</strong> 暴富后的第一件事，记得请我吃顿人均五百以上的，不能再吃麻辣烫了！' 
    }
};

const moments = [
    { id: 1, title: '半夜 12 点在微信群互发“我要早睡减肥”后的我们在干嘛？', do: '实际行动：五分钟后互相疯狂转发深夜放毒的美食视频，并愉快地拼了一单炸鸡。', dont: '试图阻拦对方，结果双双饿着肚子失眠到天亮。' },
    { id: 2, title: '当其中一人遇到极品奇葩/傻X，开始疯狂吐槽时...', do: '表面稳如老狗，私窗里化身没有感情的输出机器，我就是你的金牌 AI 嘴替，毫无底线地站在你这边！', dont: '用理智分析对错。我们不需要理智，我们需要情绪价值。' },
    { id: 3, title: '关于我们常常挂在嘴边的退休养老/暴富计划', do: '买个大别墅养两只狗三只猫，坐在摇椅上依然在八卦当年谁暗恋过谁。主打一个又穷又开心。', dont: '担心未来。有你在，再穷的退休生活也能过成欢乐喜剧人。' }
];

// --- 初始化 ---
document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initCharts();
    renderWishContent('career'); 
    renderMoments();
});

// 这些函数需要暴露给全局
window.scrollToSection = function(id) { document.getElementById(id).scrollIntoView({ behavior: 'smooth' }); };
window.toggleMobileMenu = function() { document.getElementById('mobile-menu').classList.toggle('hidden'); };

// --- 渲染函数 ---
window.renderWishContent = function(group) {
    const tabs = ['career', 'health', 'wealth'];
    tabs.forEach(g => {
        const tabEl = document.getElementById(`tab-${g}`);
        if(tabEl) tabEl.className = g === group ? "px-8 py-4 rounded-2xl font-bold text-xl transition active-tab festive-font" : "px-8 py-4 rounded-2xl font-bold text-xl transition inactive-tab festive-font";
    });
    const data = wishesData[group];
    const area = document.getElementById('wish-content-area');
    if(!area) return;
    area.style.opacity = '0';
    setTimeout(() => {
        const points = data.points.map(p => `
            <div class="mb-6 p-6 rounded-2xl bg-white/5 border border-pink-500/20 hover:border-orange-500/50 hover:bg-orange-900/20 transition">
                <h4 class="text-xl font-bold text-yellow-300 mb-2">${p.title}</h4>
                <p class="text-purple-100 leading-relaxed">${p.text}</p>
            </div>`).join('');
        area.innerHTML = `
            <div class="flex flex-col lg:flex-row gap-12">
                <div class="lg:w-1/3">
                    <h3 class="text-4xl text-white font-black mb-6 festive-font drop-shadow-[0_0_10px_rgba(255,15,123,0.8)]">${data.title}</h3>
                    <div class="p-6 bg-pink-600/20 rounded-3xl border border-pink-500/40 text-yellow-100 italic mb-6 shadow-xl leading-relaxed">${data.intro}</div>
                    <div class="p-6 bg-orange-500/10 rounded-3xl text-orange-300 border border-orange-500/30 shadow-inner font-bold">${data.activity}</div>
                </div>
                <div class="lg:w-2/3 lg:border-l border-pink-500/20 lg:pl-12">
                    ${points}
                </div>
            </div>`;
        area.style.opacity = '1';
    }, 300);
};

window.renderMoments = function() {
    const grid = document.getElementById('moment-grid');
    if(!grid) return;
    grid.innerHTML = moments.map(m => `
        <div class="glass-card rounded-[2rem] overflow-hidden border border-pink-500/20 shadow-2xl">
            <div class="p-8 flex justify-between items-center cursor-pointer hover:bg-white/5 transition" onclick="toggleMoment(${m.id})">
                <h3 class="font-bold text-xl text-yellow-100 leading-snug w-[85%]">${m.title}</h3>
                <span id="icon-${m.id}" class="text-4xl font-light text-pink-500 ml-6">👀</span>
            </div>
            <div id="moment-${m.id}" class="hidden p-8 bg-black/50 border-t border-pink-500/20 animate-fade-in">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div class="p-5 bg-orange-900/30 border border-orange-500/40 rounded-2xl text-orange-100 leading-relaxed"><strong>真实的我们：</strong> ${m.do}</div>
                    <div class="p-5 bg-pink-900/30 border border-pink-500/40 rounded-2xl text-pink-200 leading-relaxed"><strong>不存在的理智：</strong> ${m.dont}</div>
                </div>
                <div class="pt-6 border-t border-yellow-500/20">
                    <h4 class="text-sm font-black text-yellow-400 uppercase tracking-widest mb-4">🤖 AI 赛博判官（默契度测试）</h4>
                    <p class="text-sm text-purple-200 mb-4">这种情况下，你平时会对我发什么离谱表情包或吐槽？输入你的神回复，让 AI 评判我们的塑料情谊有多深！</p>
                    <div class="flex gap-4">
                        <input type="text" id="moment-input-${m.id}" placeholder="输入你的狂野发言..." class="flex-1 px-6 py-4 rounded-xl bg-black/60 border border-pink-500/30 text-white font-bold focus:ring-2 focus:ring-orange-500 outline-none">
                        <button onclick="analyzeMoment(${m.id}, '${m.title}')" class="bg-gradient-to-r from-pink-600 to-orange-500 text-white px-8 py-4 rounded-xl hover:shadow-[0_0_15px_rgba(255,15,123,0.6)] font-black transition">测一测</button>
                    </div>
                    <div id="ai-feedback-${m.id}" class="hidden mt-6 p-6 bg-pink-900/40 rounded-2xl text-sm text-yellow-100 border border-pink-500/40"></div>
                </div>
            </div>
        </div>`).join('');
};

window.toggleMoment = function(id) {
    const el = document.getElementById(`moment-${id}`);
    if(el.classList.contains('hidden')) el.classList.remove('hidden');
    else el.classList.add('hidden');
};

// --- Chart.js ---
function initCharts() {
    Chart.defaults.color = '#fde047'; 
    Chart.defaults.font.family = "'Noto Sans SC', sans-serif";
    Chart.defaults.font.weight = 'bold';

    const happyCtx = document.getElementById('happinessChart');
    if(happyCtx) {
        new Chart(happyCtx, {
            type: 'doughnut', 
            data: { 
                labels: ['疯狂搞钱的白日梦', '随时随地大小癫', '互相提供情绪价值', '深夜深夜emo互助', '间歇性踌躇满志(极少)'], 
                datasets: [{ 
                    data: [40, 30, 20, 8, 2], 
                    backgroundColor: ['#ff0f7b', '#f89b29', '#fbbf24', '#a855f7', '#a3e635'],
                    borderWidth: 2,
                    borderColor: '#0f0514' 
                }] 
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#fef08a' } } }, cutout: '65%' }
        });
    }

    const fortuneCtx = document.getElementById('fortuneChart');
    if(fortuneCtx) {
        new Chart(fortuneCtx, {
            type: 'line', 
            data: { 
                labels: ['一季度', '二季度', '三季度', '四季度', '年终奖'], 
                datasets: [
                    { label: '泼天富贵指数', data: [10, 50, 150, 500, 9999], borderColor: '#f89b29', backgroundColor: 'rgba(248, 155, 41, 0.2)', fill: true, tension: 0.4 },
                    { label: '发疯快乐指数', data: [80, 100, 150, 300, 800], borderColor: '#ff0f7b', borderDash: [5, 5], tension: 0.4 },
                    { label: '发际线坚挺度 (稳如老狗)', data: [100, 100, 100, 100, 100], borderColor: '#a3e635', tension: 0 } 
                ] 
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fef08a' } } }, scales: { y: { display: false }, x: { grid: { color: 'rgba(255, 15, 123, 0.1)' }, ticks: { color: '#fef08a' } } } }
        });
    }
}

// --- 【重要更新】安全中转调用逻辑 ---
// 所有的 AI 调用现在都通过请求你本地的 /api/chat 来实现，不再暴露 API Key
async function callGemini(prompt, sys="") {
    try {
        // 请求你自己的后端代理接口
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                prompt: prompt,
                system: sys // 将系统指令也发送给后端处理
            })
        });

        if (!response.ok) throw new Error("API代理感应失败");

        const data = await response.json();
        return data.result; // 假设后端返回 { result: "..." }
    } catch(e) { 
        console.error("AI Proxy Error:", e);
        return "糟糕，赛博网络波动，灵驹正在马力加速中... 🧧 请重试。"; 
    }
}

window.toggleChat = function() { 
    const w = document.getElementById('chat-window'); 
    if(!w) return;
    w.style.display = w.style.display === 'flex' ? 'none' : 'flex'; 
    if(w.style.display === 'flex') w.classList.add('open');
};

window.sendMessage = async function() {
    const inp = document.getElementById('chat-input');
    const msg = document.getElementById('chat-messages');
    if(!inp || !msg) return;
    const txt = inp.value.trim(); if(!txt) return;
    msg.innerHTML += `<div class="message user-message p-4 rounded-2xl text-sm self-end ml-auto shadow-[0_0_10px_rgba(255,15,123,0.5)] border border-pink-400 font-bold">${txt}</div>`;
    inp.value = ''; msg.scrollTop = msg.scrollHeight;
    msg.innerHTML += `<div id="load" class="message ai-message p-4 rounded-2xl text-sm italic">AI 嘴替正在疯狂组织语言...</div>`;
    
    const sysPrompt = "你现在是马年限定的'赛博送福马'兼用户的'互联网嘴替'。你说话极其幽默、带有强烈的Z世代网感。你在和一个正在看朋友贺卡的人聊天。无论对方说什么，你都要用高情商的互怼或彩虹屁回复，并祝他马年暴富。保持简短。";
    const reply = await callGemini(txt, sysPrompt);
    
    const loader = document.getElementById('load');
    if(loader) loader.remove();
    msg.innerHTML += `<div class="message ai-message p-4 rounded-2xl text-sm shadow-[0_0_10px_rgba(251,191,36,0.2)] font-bold">${marked.parse(reply)}</div>`;
    msg.scrollTop = msg.scrollHeight;
};

window.analyzeMoment = async function(id, title) {
    const val = document.getElementById(`moment-input-${id}`).value; if(!val) return;
    const box = document.getElementById(`ai-feedback-${id}`);
    if(!box) return;
    box.classList.remove('hidden'); box.innerHTML = "AI 正在读取你们的塑料脑电波...";
    
    const sysPrompt = "你是一个幽默毒舌的'赛博判官'。评价用户输入的话，给出一个搞笑的默契度评分（0-100%），并附带一句神吐槽。语气要符合年轻人上网发疯的状态。总字数控制在80字内。";
    const reply = await callGemini(`情境: ${title}。用户作为朋友回答说: "${val}"。请给这个回答打个默契分并狠狠吐槽。`, sysPrompt);
    
    box.innerHTML = `<strong>判官裁决：</strong><br> ${marked.parse(reply)}`;
};

window.getFortuneBag = async function() {
    const wish = document.getElementById('wish-input').value;
    const box = document.getElementById('fortune-result');
    if(!wish || !box) return;
    
    box.classList.remove('hidden'); 
    box.innerHTML = "<div class='text-center text-pink-400 font-bold animate-pulse'>🏮 赛博宇宙正在接收你的订单，请稍候...</div>";
    
    const prompt = `朋友的新年愿望是：【${wish}】。请给他/她写一段极其幽默、有网感的祝福语，祝愿望成真。然后，赐予他/她一个搞笑的"赛博开运吉祥物"（必须包含Emoji），并用搞笑的口吻解释它的奇葩功效。`;
    const sysPrompt = "你是一个发新年盲盒的搞笑神仙。回复分两段：第一段是对愿望的毒舌或幽默祝福；第二段必须用【你的赛博开运物：XXX】开头，然后解释功效。语气要符合网络乐子人。";
    
    const reply = await callGemini(prompt, sysPrompt);
    
    box.innerHTML = `<div class="flex items-start gap-5"><div class="text-5xl mt-2 animate-bounce">🎁</div><div class="text-white text-lg leading-relaxed font-bold">${marked.parse(reply)}</div></div>`;
};

// --- NEW: Cyber Couplet Generator ---
window.generateCouplet = async function() {
    const input = document.getElementById('couplet-keyword');
    const display = document.getElementById('couplet-display');
    const loading = document.getElementById('couplet-loading');
    if(!input || !display || !loading) return;

    const keyword = input.value;
    if(!keyword) return;
    
    display.classList.add('hidden');
    loading.classList.remove('hidden');
    
    const prompt = `User keyword: "${keyword}". Generate a funny, Z-Gen style, internet slang filled Chinese New Year couplet (Upper scroll, Lower scroll, Horizontal batch). 
    Format: RETURN ONLY JSON: { "up": "Upper scroll text (7 chars max)", "down": "Lower scroll text (7 chars max)", "batch": "Horizontal batch (4 chars)" }`;
    
    const reply = await callGemini(prompt, "You are a cyber poet specialized in funny Chinese couplets.");
    
    loading.classList.add('hidden');
    display.classList.remove('hidden');
    display.classList.add('flex');
    
    try {
        const jsonStr = reply.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);
        
        document.getElementById('up-text').innerText = data.up;
        document.getElementById('down-text').innerText = data.down;
        document.getElementById('batch-text').innerText = data.batch;
    } catch(e) {
        document.getElementById('batch-text').innerText = "系统繁忙";
        document.getElementById('up-text').innerText = "财神去吃火锅了";
        document.getElementById('down-text').innerText = "稍后再来求对联";
    }
};
