import Invoice from '../models/Invoice.js';

/**
 * Build (or return the existing) Invoice document for a completed booking.
 * Idempotent: one invoice per booking.
 */
export const generateInvoiceForBooking = async (booking) => {
  const existing = await Invoice.findOne({ booking: booking._id });
  if (existing) return existing;

  const items = [];

  if (booking.visitingCharge > 0) {
    items.push({
      description: 'Visiting / Inspection charge',
      quantity: 1,
      unitPrice: booking.visitingCharge,
      amount: booking.visitingCharge,
      kind: 'visiting',
    });
  }

  booking.repairServices.forEach((r) => {
    items.push({
      description: r.name,
      quantity: 1,
      unitPrice: r.charge,
      amount: r.charge,
      kind: 'service',
    });
  });

  booking.spareParts.forEach((s) => {
    items.push({
      description: s.name,
      quantity: s.quantity,
      unitPrice: s.price,
      amount: s.amount,
      kind: 'spare',
    });
  });

  const addr = booking.address || {};
  const addressLine = [addr.houseNo, addr.street, addr.area, addr.city, addr.state, addr.pincode]
    .filter(Boolean)
    .join(', ');

  const invoice = await Invoice.create({
    booking: booking._id,
    user: booking.user,
    billTo: {
      name: addr.fullName,
      mobile: addr.mobile,
      addressLine,
    },
    items,
    visitingCharge: booking.visitingCharge,
    serviceCharge: booking.serviceCharge,
    spareCharge: booking.spareCharge,
    taxRate: booking.taxRate,
    tax: booking.tax,
    totalAmount: booking.totalAmount,
    paymentStatus: booking.paymentStatus,
  });

  return invoice;
};
