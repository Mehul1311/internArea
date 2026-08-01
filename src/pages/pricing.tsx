import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/axios';
import { toast } from 'react-toastify';
import { Sparkles, Check, Clock, Receipt, ToggleLeft, ToggleRight, QrCode, CreditCard, ShieldCheck, X, CheckCircle2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function PricingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentTab, setPaymentTab] = useState<'qr' | 'card' | 'upi'>('qr');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const currentUser = 'student@example.com';

  useEffect(() => {
    fetchPlans();
    fetchStatus();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await apiClient.get('/subscribe/plans');
      setPlans(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await apiClient.get(`/subscribe/status/${currentUser}`);
      setCurrentSub(res.data);
    } catch (e) {}
  };

  const handleInitiateSubscribe = async (plan: any) => {
    if (plan.price === 0) {
      toast.info("You are already on the Free tier!");
      return;
    }

    try {
      setLoading(true);
      // Initiate subscription check (10:00 AM - 11:00 AM IST)
      const orderRes = await apiClient.post('/subscribe', {
        username: currentUser,
        planId: plan.id
      });

      setSelectedPlan({
        ...plan,
        orderId: orderRes.data.id
      });
      setShowPaymentModal(true);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Payment failed";
      toast.error(`⚠️ ${errMsg}`, { autoClose: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayment = async () => {
    if (!selectedPlan) return;

    try {
      setLoading(true);
      const confirmRes = await apiClient.post('/subscribe/confirm-mock-payment', {
        username: currentUser,
        orderId: selectedPlan.orderId,
        planId: selectedPlan.id,
        paymentMethod: paymentTab === 'qr' ? 'UPI QR Code (GPay/PhonePe)' : paymentTab === 'upi' ? 'UPI ID' : 'Debit/Credit Card'
      });

      setInvoice(confirmRes.data.invoice);
      setShowPaymentModal(false);
      setShowInvoiceModal(true);
      fetchStatus();
      toast.success("🎉 Payment Received! Subscription activated successfully!");
    } catch (err: any) {
      toast.error("Payment confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  const upiQrUrl = selectedPlan 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=internshala@razorpay&pn=InternArea&am=${selectedPlan.price}&cu=INR`)}`
    : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-4 py-1.5 rounded-full mb-3">
            <Sparkles size={14} className="text-amber-500" /> Upgrade Your Application Limits
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Internship Application Plans</h1>
          <p className="text-gray-600 text-sm mt-2">
            Choose the right subscription plan to apply to more internships and land your dream role faster.
          </p>
        </div>

        {/* Current Subscription Banner */}
        {currentSub && (
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 mb-10 shadow-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-blue-200 font-semibold uppercase tracking-wider">Your Active Subscription</div>
              <div className="text-2xl font-extrabold mt-1">{currentSub.plan_name} Plan</div>
              <div className="text-xs text-blue-100 mt-1">
                Applications Used: <strong>{currentSub.applications_used || 0}</strong> / {currentSub.application_limit === null ? 'Unlimited' : currentSub.application_limit}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-xs font-bold">
              Active Tier
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => {
            const isFree = plan.price === 0;
            const isGold = plan.name === 'Gold';

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                  isGold
                    ? 'border-2 border-amber-400 shadow-xl relative scale-105 bg-gradient-to-b from-amber-50/30 to-white'
                    : 'border-gray-200 shadow-sm hover:shadow-md'
                }`}
              >
                {isGold && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full shadow-sm">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name} Plan</h3>
                  <div className="mb-6">
                    <span className="text-3xl font-extrabold text-gray-900">₹{plan.price}</span>
                    <span className="text-xs text-gray-500 font-semibold"> / month</span>
                  </div>

                  <div className="space-y-3 text-xs text-gray-700 mb-8 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-emerald-600 flex-shrink-0" />
                      <span className="font-bold">
                        {plan.application_limit === null ? 'Unlimited Applications' : `Apply to ${plan.application_limit} Internship(s) / mo`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-emerald-600 flex-shrink-0" />
                      <span>Direct Employer Visibility</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-emerald-600 flex-shrink-0" />
                      <span>Instant Email Invoice & Receipt</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleInitiateSubscribe(plan)}
                  disabled={loading}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition shadow-sm ${
                    isFree
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : isGold
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isFree ? 'Current Free Tier' : `Subscribe to ${plan.name} (₹${plan.price})`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Razorpay UPI QR Code & Card Checkout Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
            {/* Razorpay Top Bar */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white font-extrabold px-2.5 py-1 rounded text-sm">
                  Razorpay
                </div>
                <div>
                  <div className="text-xs text-blue-200">Paying InternArea</div>
                  <div className="text-xl font-extrabold">₹{selectedPlan.price}</div>
                </div>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-blue-200 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Tabs Removed - Only QR is shown */}

            <div className="p-6">
              {/* Tab 1: UPI QR Code */}
              {paymentTab === 'qr' && (
                <div className="text-center space-y-4">
                  <div className="text-xs font-semibold text-gray-600">
                    Scan with any UPI App (Google Pay, PhonePe, Paytm, BHIM)
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <div className="w-48 h-48 relative mb-4">
                      <Image src="/my-qr.jpg" alt="UPI Payment QR Code" fill style={{ objectFit: 'contain' }} className="p-3" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Scan to pay with any UPI app</p>
                    <p className="font-mono text-gray-700 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">mehulsain1603-4@oksbi</p>
                  </div>

                  <p className="text-[11px] text-gray-400">
                    Scan the QR code using GPay/PhonePe app or click button below to simulate scanning & payment completion.
                  </p>
                </div>
              )}

              {/* Tab 2: UPI Apps */}
              {paymentTab === 'upi' && (
                <div className="space-y-4 text-xs">
                  <label className="block font-bold text-gray-700">Enter UPI ID</label>
                  <input
                    type="text"
                    placeholder="username@upi or 9876543210@paytm"
                    className="w-full p-3 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    defaultValue="student@okaxis"
                  />
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-gray-600">
                    <div className="p-2 border border-gray-200 rounded-xl bg-blue-50/50">GPay</div>
                    <div className="p-2 border border-gray-200 rounded-xl bg-purple-50/50">PhonePe</div>
                    <div className="p-2 border border-gray-200 rounded-xl bg-cyan-50/50">Paytm</div>
                    <div className="p-2 border border-gray-200 rounded-xl bg-orange-50/50">BHIM</div>
                  </div>
                </div>
              )}

              {/* Tab 3: Card Payment */}
              {paymentTab === 'card' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleCompletePayment}
                disabled={loading}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3.5 rounded-2xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck size={18} />
                <span>{loading ? 'Processing Payment...' : `Pay ₹${selectedPlan.price} Now`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && invoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Receipt size={28} />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">Payment Invoice</h3>
              <p className="text-xs text-gray-500 mt-1">Invoice Receipt & Plan Details</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-xs mb-6 border border-gray-200">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Invoice No:</span>
                <span className="font-mono font-bold text-gray-800">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Plan Subscribed:</span>
                <span className="font-bold text-indigo-600">{invoice.planName} Plan</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-bold text-gray-900 text-sm">₹{invoice.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Valid Until:</span>
                <span className="font-semibold text-gray-800">{new Date(invoice.endDate).toLocaleDateString()}</span>
              </div>
            </div>

            <button
              onClick={() => setShowInvoiceModal(false)}
              className="w-full bg-blue-600 text-white font-bold text-xs py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
