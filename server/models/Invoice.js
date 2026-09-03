import mongoose from 'mongoose';

const invoiceLineSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    amount: { type: Number, required: true },
    // 'service' or 'spare' — used to group lines on the printed invoice.
    kind: { type: String, enum: ['service', 'spare', 'visiting'], default: 'service' },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceBooking',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    billTo: {
      name: String,
      mobile: String,
      addressLine: String,
    },
    items: [invoiceLineSchema],
    visitingCharge: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    spareCharge: { type: Number, default: 0 },
    taxRate: { type: Number, default: 18 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Generate a sequential invoice number: INV-YYMMDD-XXXX
invoiceSchema.pre('save', function (next) {
  if (this.invoiceNumber) return next();
  const d = new Date();
  const stamp = `${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate()
  ).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  this.invoiceNumber = `INV-${stamp}-${rand}`;
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
