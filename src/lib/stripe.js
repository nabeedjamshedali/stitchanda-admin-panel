import Stripe from 'stripe';

// Initialize Stripe with secret key from environment
const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY);

/**
 * Fetch all balance transactions from Stripe
 * This includes all successful charges, refunds, transfers, etc.
 */
export const getStripeBalance = async () => {
  try {
    const balance = await stripe.balance.retrieve();
    return balance;
  } catch (error) {
    console.error('Error fetching Stripe balance:', error);
    throw error;
  }
};

/**
 * Fetch all payment intents (charges) from Stripe
 * @param {number} limit - Number of payments to fetch (default: 100)
 */
export const getStripePayments = async (limit = 100) => {
  try {
    const charges = await stripe.charges.list({
      limit: limit,
    });

    return charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount / 100, // Convert from cents to dollars/PKR
      currency: charge.currency.toUpperCase(),
      status: charge.status, // succeeded, pending, failed
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

/**
 * Calculate total revenue from Stripe
 * Gets all successful charges and sums them up
 */
export const getTotalRevenue = async () => {
  try {
    let totalRevenue = 0;
    let hasMore = true;
    let startingAfter = null;

    // Paginate through all charges
    while (hasMore) {
      const params = {
        limit: 100,
        ...(startingAfter && { starting_after: startingAfter })
      };

      const charges = await stripe.charges.list(params);

      // Sum up successful charges
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

    // Convert from cents to main currency unit
    return totalRevenue / 100;
  } catch (error) {
    console.error('Error calculating total revenue:', error);
    throw error;
  }
};

/**
 * Get payment statistics from Stripe
 */
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

/**
 * Search for a specific payment by charge ID
 */
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
