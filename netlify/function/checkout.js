// 导入 Stripe 库
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 定义您要使用的 Stripe Price ID
// ⚠️ 确保这个 ID 和您在 Stripe 仪表盘中设置的订阅价格 ID 匹配
const PRO_MONTHLY_PRICE_ID = 'price_1SeeyzGpbs4hTZTLeORhlcoV'; 

// Netlify Function 的主处理程序
exports.handler = async (event, context) => {
  // 确保请求方法是 POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // 关键修改：直接使用预设的 Price ID
    const finalPriceId = PRO_MONTHLY_PRICE_ID; 

    // 创建 Stripe 结账会话
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', 

      // 成功和失败后的重定向 URL
      success_url: `${process.env.URL}/?success=true`,
      cancel_url: `${process.env.URL}/?canceled=true`,
    });

    // ✅ 关键修复点：返回 sessionId 和 url 给前端
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        sessionId: session.id, 
        url: session.url // 👈 Stripe 提供的完整支付链接
      }),
    };

  } catch (error) {
    console.error('Stripe Session Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' }),
    };
  }
};
