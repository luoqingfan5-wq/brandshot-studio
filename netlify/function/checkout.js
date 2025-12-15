// 导入 Stripe 库
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 定义您要使用的 Stripe Price ID
// ⚠️ 修正后的 Price ID: price_1SeeyzGpbs4hTZTLeORhlcoV
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
    // ⚠️ 关键修改：不再验证前端发送的 priceId，直接使用我们预设的 Price ID
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

      // 成功和失败后的重定向 URL，请替换成您的网站地址
      success_url: `${process.env.URL}/?success=true`,
      cancel_url: `${process.env.URL}/?canceled=true`,
    });

    // 返回会话 ID 给前端
    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };

  } catch (error) {
    console.error('Stripe Session Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create checkout session' }),
    };
  }
};
