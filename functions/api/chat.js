// functions/api/chat.js

export async function onRequestPost(context) {
    const { request, env } = context;

    // 1. 获取前端传来的 prompt
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: "无效的请求请求体" }), { status: 400 });
    }

    const { prompt, system } = body;
    const apiKey = env.ZHIPU_API_KEY; // 从 Cloudflare 后台的环境变量中读取

    // 2. 调用智谱 AI (BigModel) V4 接口
    try {
        const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "glm-4-flash", // 使用 Flash 模型以获得最快响应速度
                messages: [
                    { role: "system", content: system || "你是一个赛博马年贺岁助手。" },
                    { role: "user", content: prompt }
                ],
                stream: false
            })
        });

        const data = await response.json();
        const resultText = data.choices[0].message.content;

        // 3. 返回符合标准 Response 的 JSON
        return new Response(JSON.stringify({ result: resultText }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "智谱 AI 感应失败" }), { status: 500 });
    }
}
