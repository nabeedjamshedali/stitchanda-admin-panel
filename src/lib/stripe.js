import Stripe from 'stripe';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY);

export const getStripeBalance = async () => {
  try {
    const balance = await stripe.balance.retrieve();
    return balance;
  } catch (error) {
    console.error('Error fetching Stripe balance:', error);
    throw error;
  }
};


export const getStripePayments = async (limit = 100) => {
  try {
    const charges = await stripe.charges.list({
      limit: limit,
    });

    return charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount / 100, 
      currency: charge.currency.toUpperCase(),
      status: charge.status, 
      paid: charge.paid,
      customerEmail: charge.billing_details?.email || charge.receipt_email,
      customerName: charge.billing_details?.name || '-',
      description: charge.description,
      created: new Date(charge.created * 1000),
      paymentMethod: charge.payment_method_details?.type || '-',
      receiptUrl: charge.receipt_url,
    }));
  } catch (error) {
    console.error('Error fetching Stripe payments:', error);
    throw error;
  }
};

export const getTotalRevenue = async () => {
  try {
    let totalRevenue = 0;
    let hasMore = true;
    let startingAfter = null;

    while (hasMore) {
      const params = {
        limit: 100,
        ...(startingAfter && { starting_after: startingAfter })
      };

      const charges = await stripe.charges.list(params);

      charges.data.forEach(charge => {
        if (charge.status === 'succeeded' && charge.paid) {
          totalRevenue += charge.amount;
        }
      });

      hasMore = charges.has_more;
      if (hasMore && charges.data.length > 0) {
        startingAfter = charges.data[charges.data.length - 1].id;
      }
    }

    return totalRevenue / 100;
  } catch (error) {
    console.error('Error calculating total revenue:', error);
    throw error;
  }
};

export const getPaymentStatistics = async () => {
  try {
    const charges = await stripe.charges.list({ limit: 100 });

    let totalRevenue = 0;
    let successfulPayments = 0;
    let failedPayments = 0;
    let pendingPayments = 0;
    let refundedAmount = 0;

    charges.data.forEach(charge => {
      if (charge.status === 'succeeded' && charge.paid) {
        totalRevenue += charge.amount;
        successfulPayments++;
      } else if (charge.status === 'failed') {
        failedPayments++;
      } else if (charge.status === 'pending') {
        pendingPayments++;
      }

      if (charge.refunded) {
        refundedAmount += charge.amount_refunded;
      }
    });

    return {
      totalRevenue: totalRevenue / 100,
      refundedAmount: refundedAmount / 100,
      netRevenue: (totalRevenue - refundedAmount) / 100,
      totalTransactions: charges.data.length,
      successfulPayments,
      failedPayments,
      pendingPayments,
    };
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    throw error;
  }
};


export const getPaymentById = async (chargeId) => {
  try {
    const charge = await stripe.charges.retrieve(chargeId);
    return {
      id: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency.toUpperCase(),
      status: charge.status,
      paid: charge.paid,
      customerEmail: charge.billing_details?.email || charge.receipt_email,
      customerName: charge.billing_details?.name || '-',
      description: charge.description,
      created: new Date(charge.created * 1000),
      paymentMethod: charge.payment_method_details?.type || '-',
      receiptUrl: charge.receipt_url,
    };
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
};
