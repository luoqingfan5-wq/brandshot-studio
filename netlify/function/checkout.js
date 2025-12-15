// 导入 Stripe 库
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 定义您要使用的 Stripe Price ID
// ⚠️ 注意：这个 ID 必须和您在 Stripe 后台（测试模式）创建的价格 ID 完全匹配。
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
    // 解析前端发送的请求体
    const { priceId } = JSON.parse(event.body);

    // 检查前端请求的价格 ID 是否有效，确保只使用我们定义的 ID
    let finalPriceId = '';

    if (priceId === 'monthly') {
      finalPriceId = PRO_MONTHLY_PRICE_ID;
    } 
    // 您也可以在这里添加 Lifetime Deal 的逻辑
    // else if (priceId === 'lifetime') {
    //   finalPriceId = LIFETIME_PRICE_ID; 
    // } 
    else {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid Price Selection' }),
        };
    }


    // 创建 Stripe 结账会话
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // 如果是月付订阅，使用 subscription 模式
      // mode: 'payment', // 如果是终身购买，使用 payment 模式

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
