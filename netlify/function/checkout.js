// netlify/functions/checkout.js
// 这是一个 Netlify Serverless Function

// 引入 Stripe 库
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 

// ** 替换为您的真实 Stripe Price ID **
// 请在 Stripe 后台创建这两个产品并获取 ID
const PRICE_IDS = {
  monthly: 'price_xxxxxxxxxxxx', // 替换为你的月订阅 Price ID
  lifetime: 'price_yyyyyyyyyyyy', // 替换为你的买断 Price ID
};

exports.handler = async (event, context) => {
  // 只处理 POST 请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // 从前端获取计划类型
    const { planType } = JSON.parse(event.body); 

    const priceId = PRICE_IDS[planType];
    const mode = planType === 'monthly' ? 'subscription' : 'payment';

    if (!priceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid plan type provided.' }),
      };
    }

    // 获取部署的域名作为返回地址的基础
    const domain = event.headers.host;
    const successUrl = `https://${domain}/?payment=success`;
    const cancelUrl = `https://${domain}/?payment=canceled`;

    // 创建 Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    // 返回 Stripe 结账页面的 URL
    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };

  } catch (error) {
    console.error('Stripe API Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};