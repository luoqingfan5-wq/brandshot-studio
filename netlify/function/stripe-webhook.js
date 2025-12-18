const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // 1. 记录：收到消息了！
  console.log("【日志】收到来自 Stripe 的 Webhook 消息了！");

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = event.headers['stripe-signature'];

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
    // 2. 记录：验证通过
    console.log("【日志】验证成功，这封信确实是 Stripe 发来的。");
  } catch (err) {
    // 3. 记录：如果验证失败，记录原因
    console.error(`【错误】验证失败了: ${err.message}`);
    return { statusCode: 400, body: `Error: ${err.message}` };
  }

  // 4. 处理：如果是支付成功的消息
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    
    // 5. 记录：谁付了钱？
    console.log(`【支付成功】用户邮箱是: ${session.customer_details.email}`);
    console.log(`【支付成功】这笔订单的金额是: ${session.amount_total / 100} 元`);

    // 这里以后会写具体的“开通会员”逻辑
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
};
