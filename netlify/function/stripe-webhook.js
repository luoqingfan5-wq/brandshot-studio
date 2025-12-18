const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // 你需要在 Stripe 后台获取这个密钥
  const sig = event.headers['stripe-signature'];

  let stripeEvent;

  try {
    // 验证请求是否真的来自 Stripe，防止伪造请求
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // 处理支付成功的事件
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    // 获取用户信息
    const customerEmail = session.customer_details.email;
    const sessionId = session.id;

    console.log(`支付成功！用户邮箱: ${customerEmail}`);

    // --- 在这里执行你的业务逻辑 ---
    // 例如：
    // 1. 在数据库中将该 Email 标记为 PRO 用户
    // 2. 或者给用户发一封带有专属下载链接的邮件
    // ----------------------------
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};