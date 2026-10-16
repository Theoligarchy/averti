import React, { useState, useEffect } from 'react';
import {
  X,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Clock,
  Calendar,
  MapPin,
  FileText,
  Copy,
  Check,
  Building2,
  Lock,
  ArrowRight,
  Info,
  Send,
  Eye,
  AlertCircle
} from 'lucide-react';

export const NoticeTipModal = ({
  isOpen,
  onClose,
  notice,
  onTipSubmitted
}) => {
  // Step workflow: 1 = Structured Sighting Form & Safeguard, 2 = Phone OTP, 3 = Digital Receipt
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [sightingDateTime, setSightingDateTime] = useState('');
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [clothingOrVehicle, setClothingOrVehicle] = useState('');
  const [safeguardAccepted, setSafeguardAccepted] = useState(false);

  // OTP State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Generated Digital Receipt State
  const [receiptData, setReceiptData] = useState(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [simulatedLiveStatus, setSimulatedLiveStatus] = useState('Submitted');

  // Reset states when notice changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      // Pre-fill local date-time string in YYYY-MM-DDTHH:mm format
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setSightingDateTime(now.toISOString().slice(0, 16));
      setLandmark('');
      setDescription('');
      setClothingOrVehicle('');
      setSafeguardAccepted(false);
      setPhoneNumber('');
      setOtpCode('');
      setOtpSent(false);
      setIsSendingOtp(false);
      setIsVerifying(false);
      setOtpTimer(0);
      setReceiptData(null);
      setCopiedReceipt(false);
      setSimulatedLiveStatus('Submitted');
    }
  }, [isOpen, notice]);

  // Handle countdown for resending OTP
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpTimer]);

  if (!isOpen || !notice) return null;

  // Mask phone number for receipt (e.g., +91 98******12)
  const getMaskedPhone = (num) => {
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      const last10 = cleaned.slice(-10);
      return `+91 ${last10.slice(0, 2)}******${last10.slice(-2)}`;
    }
    return `+91 ${num.slice(0, 2)}******${num.slice(-2) || '00'}`;
  };

  // Step 1 Validation: Date, Locality, Description, and Mandatory Safeguard Checkbox
  const isStep1Valid =
    sightingDateTime.trim() !== '' &&
    landmark.trim().length >= 3 &&
    description.trim().length >= 10 &&
    safeguardAccepted === true;

  // Handle Proceeding from Step 1 to Step 2
  const handleProceedToOtp = (e) => {
    e.preventDefault();
    if (!isStep1Valid) return;
    setCurrentStep(2);
  };

  // Simulated OTP Generation and dispatch
  const handleSendOtp = () => {
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length < 10) return;

    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      setOtpCode('4829'); // Simulated pre-filled or hint OTP for demo/testing
      setOtpTimer(30);
    }, 900);
  };

  // Step 2 Submission & Verification
  const handleVerifyAndSubmit = (e) => {
    e.preventDefault();
    if (!otpSent || otpCode.length < 4) return;

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);

      // Generate Unique Receipt ID
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const generatedReceiptId = `#AV-2026-${randomDigits}`;
      const submissionTimestamp = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) + ' IST';

      const maskedPhone = getMaskedPhone(phoneNumber);

      const newReceipt = {
        receiptId: generatedReceiptId,
        noticeRef: notice.referenceNumber || notice.id || 'AV-REF-GEN',
        noticeTitle: notice.title || 'Official Safety Notice',
        issuingAuthority: notice.contactDepartment || notice.issuingAuthority || 'District Police Commissionerate',
        jurisdiction: notice.jurisdiction || 'India',
        sightingDateTime: new Date(sightingDateTime).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) + ' IST',
        landmark: landmark.trim(),
        description: description.trim(),
        clothingOrVehicle: clothingOrVehicle.trim() || 'Not specified',
        verifiedPhone: maskedPhone,
        submittedAt: submissionTimestamp,
        currentStatus: 'Received / Pending Police Review'
      };

      setReceiptData(newReceipt);
      setCurrentStep(3);

      // Propagate tip submission to App / Dashboard if callback provided
      if (typeof onTipSubmitted === 'function') {
        onTipSubmitted(newReceipt);
      }
    }, 1100);
  };

  const handleCopyReceipt = () => {
    if (!receiptData) return;
    const textToCopy = `AVERTI CITIZEN TIP DIGITAL RECEIPT\nReceipt ID: ${receiptData.receiptId}\nCase Notice: ${receiptData.noticeRef} (${receiptData.noticeTitle})\nJurisdiction: ${receiptData.jurisdiction}\nAuthority: ${receiptData.issuingAuthority}\nSighting Time: ${receiptData.sightingDateTime}\nLocality/Landmark: ${receiptData.landmark}\nStatus: ${simulatedLiveStatus}\nVerified Phone: ${receiptData.verifiedPhone}\nSubmitted: ${receiptData.submittedAt}\n\nAverti is an independent public-safety atlas. No vigilantism permitted. Official investigations are conducted exclusively by law enforcement authorities.`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0B1F33]/65 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#D5DCE0] overflow-hidden my-4 sm:my-8 text-[#0B1F33] flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-tip-title"
      >
        {/* Top Header Bar */}
        <div className="bg-[#F6F8F7] border-b border-[#D5DCE0] px-5 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#E8F0EE] border border-[#0F766E]/20 flex items-center justify-center text-[#0F766E] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#0F766E] bg-white px-2 py-0.5 rounded border border-[#0F766E]/20">
                  Citizen Information Portal
                </span>
                <span className="text-xs text-[#475569] hidden sm:inline tabular-nums">
                  Ref: {notice.referenceNumber}
                </span>
              </div>
              <h1 id="modal-tip-title" className="text-lg font-serif font-bold text-[#0B1F33] leading-snug">
                Submit Information to Police
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-md border border-[#D5DCE0] flex items-center justify-center text-[#475569] hover:bg-white hover:text-[#0B1F33] transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="bg-white border-b border-[#D5DCE0] px-6 py-2.5 flex items-center justify-between text-xs font-sans shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep >= 1
                  ? 'bg-[#0F766E] text-white'
                  : 'bg-[#E5E7EB] text-[#475569]'
              }`}
            >
              1
            </span>
            <span
              className={`font-medium ${
                currentStep === 1 ? 'text-[#0B1F33] font-semibold' : 'text-[#475569]'
              }`}
            >
              Structured Sighting
            </span>
          </div>

          <div className="w-8 sm:w-16 h-0.5 bg-[#D5DCE0]" />

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep >= 2
                  ? 'bg-[#0F766E] text-white'
                  : 'bg-[#E5E7EB] text-[#475569]'
              }`}
            >
              2
            </span>
            <span
              className={`font-medium ${
                currentStep === 2 ? 'text-[#0B1F33] font-semibold' : 'text-[#475569]'
              }`}
            >
              OTP Verification
            </span>
          </div>

          <div className="w-8 sm:w-16 h-0.5 bg-[#D5DCE0]" />

          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                currentStep === 3
                  ? 'bg-[#15803D] text-white'
                  : 'bg-[#E5E7EB] text-[#475569]'
              }`}
            >
              3
            </span>
            <span
              className={`font-medium ${
                currentStep === 3 ? 'text-[#15803D] font-bold' : 'text-[#475569]'
              }`}
            >
              Digital Receipt
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto font-sans flex-1">
          {/* ============================================================ */}
          {/* STEP 1: Structured Sighting Form & Safeguard */}
          {/* ============================================================ */}
          {currentStep === 1 && (
            <form onSubmit={handleProceedToOtp} className="space-y-5">
              {/* Mandatory Safeguard Warning Banner */}
              <div className="p-4 rounded-lg bg-[#FFFBEB] border-2 border-[#B45309] text-[#0B1F33] space-y-1.5 shadow-xs">
                <div className="flex items-center gap-2 text-[#B45309] font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>CRITICAL SAFEGUARD: DO NOT APPROACH OR CONFRONT</span>
                </div>
                <p className="text-xs text-[#0B1F33] leading-relaxed">
                  Do not approach, follow, or interrogate anyone. This notice is an official request for
                  information by investigating police authorities, <strong>not a finding of guilt or a call for citizen action</strong>.
                  Physical intervention is dangerous and unlawful.
                </p>
              </div>

              {/* Notice Context Pill */}
              <div className="bg-[#F6F8F7] border border-[#D5DCE0] rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[#64748B] block">Subject of Information:</span>
                  <span className="font-bold text-[#0B1F33] text-sm font-serif">
                    {notice.title}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[#64748B] block">Authority:</span>
                  <span className="font-semibold text-[#0B1F33]">
                    {notice.contactDepartment || notice.issuingAuthority || 'Police Department'}
                  </span>
                </div>
              </div>

              {/* Structured Inputs Grid */}
              <div className="space-y-4">
                {/* Date & Time */}
                <div>
                  <label
                    htmlFor="sighting-datetime"
                    className="block text-xs font-bold text-[#0B1F33] uppercase tracking-wider mb-1.5"
                  >
                    Date & Time of Sighting <span className="text-[#D92D20]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="sighting-datetime"
                      type="datetime-local"
                      required
                      value={sightingDateTime}
                      onChange={(e) => setSightingDateTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] text-[#0B1F33] tabular-nums"
                    />
                  </div>
                  <p className="text-[11px] text-[#475569] mt-1">
                    Please specify the exact date and approximate time you observed this person or event.
                  </p>
                </div>

                {/* Major Landmark / Locality */}
                <div>
                  <label
                    htmlFor="sighting-landmark"
                    className="block text-xs font-bold text-[#0B1F33] uppercase tracking-wider mb-1.5"
                  >
                    Locality / Major Landmark / Intersection <span className="text-[#D92D20]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      id="sighting-landmark"
                      type="text"
                      required
                      placeholder="e.g., Rasulgarh Square near overbridge tea stall, Bhubaneswar"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-white border border-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] text-[#0B1F33]"
                    />
                  </div>
                  <p className="text-[11px] text-[#475569] mt-1">
                    Provide identifiable landmarks (bus stands, shop names, crossroads, metro gates).
                  </p>
                </div>

                {/* Description of What You Saw */}
                <div>
                  <label
                    htmlFor="sighting-description"
                    className="block text-xs font-bold text-[#0B1F33] uppercase tracking-wider mb-1.5"
                  >
                    Specific Observation & Context <span className="text-[#D92D20]">*</span>
                  </label>
                  <textarea
                    id="sighting-description"
                    required
                    rows={3}
                    placeholder="Describe what occurred, who they were with, directional movement, demeanor, or any notable actions..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] text-[#0B1F33] resize-y min-h-[80px]"
                  />
                  <p className="text-[11px] text-[#475569] mt-1">
                    Minimum 10 characters. Avoid speculation; state observable facts.
                  </p>
                </div>

                {/* Clothing, Vehicle, or Distinctive Features (Optional) */}
                <div>
                  <label
                    htmlFor="sighting-clothing"
                    className="block text-xs font-bold text-[#0B1F33] uppercase tracking-wider mb-1.5"
                  >
                    Clothing, Footwear, or Vehicle Details (Optional)
                  </label>
                  <input
                    id="sighting-clothing"
                    type="text"
                    placeholder="e.g., Faded blue cotton shirt, grey trousers, white helmet, silver motorcycle (OD-02...)"
                    value={clothingOrVehicle}
                    onChange={(e) => setClothingOrVehicle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] text-[#0B1F33]"
                  />
                </div>
              </div>

              {/* Hard Guardrail Mandatory Checkbox */}
              <div className="p-4 bg-[#F6F8F7] rounded-lg border-2 border-[#D5DCE0] hover:border-[#64748B] transition-colors">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="safeguard-checkbox"
                    checked={safeguardAccepted}
                    onChange={(e) => setSafeguardAccepted(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded border-2 border-[#64748B] text-[#0F766E] focus:ring-[#0F766E] cursor-pointer shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#0B1F33] block leading-tight">
                      I confirm I have not approached, followed, or confronted anyone in connection with this notice.
                    </span>
                    <span className="text-[11px] text-[#475569] block leading-relaxed">
                      I acknowledge that all investigations are carried out exclusively by state and central law enforcement, and providing false or harassing information is punishable under Indian law.
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-[#64748B] text-xs font-bold text-[#475569] hover:bg-[#F6F8F7] hover:text-[#0B1F33] transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!isStep1Valid}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                    isStep1Valid
                      ? 'bg-[#0F766E] text-white hover:bg-[#0D655E] cursor-pointer shadow-sm'
                      : 'bg-[#9CC4C1] text-white cursor-not-allowed'
                  }`}
                >
                  <span>Next: Verify Mobile Number</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* STEP 2: Simulated Phone OTP Verification */}
          {/* ============================================================ */}
          {currentStep === 2 && (
            <div className="space-y-5">
              {/* Header explanation */}
              <div className="bg-[#E8F0EE] border border-[#0F766E]/30 rounded-lg p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-[#0F766E] font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <span>Verify Identity via Mobile OTP</span>
                </div>
                <p className="text-xs text-[#0B1F33] leading-relaxed">
                  To prevent spam, automated bots, and malicious false tips, please verify your mobile number.
                  <strong> Averti does not display or publish your mobile number</strong>. Your phone is masked
                  and shared only with the designated Station House Officer handling this investigation.
                </p>
              </div>

              {/* Sighting Summary Preview */}
              <div className="bg-[#F6F8F7] border border-[#D5DCE0] rounded-lg p-3.5 text-xs space-y-1.5">
                <div className="font-bold text-[#0B1F33] flex items-center justify-between">
                  <span>Report Summary</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[#0F766E] hover:underline font-semibold cursor-pointer text-[11px]"
                  >
                    Edit details
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#475569] pt-1">
                  <div>
                    <span className="font-semibold text-[#0B1F33]">Location: </span>
                    {landmark}
                  </div>
                  <div>
                    <span className="font-semibold text-[#0B1F33]">Time: </span>
                    {sightingDateTime.replace('T', ' ')}
                  </div>
                </div>
              </div>

              {/* Mobile Input Section */}
              <form onSubmit={handleVerifyAndSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="mobile-input"
                    className="block text-xs font-bold text-[#0B1F33] uppercase tracking-wider mb-1.5"
                  >
                    Mobile Phone Number <span className="text-[#D92D20]">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="w-20 px-3 py-2.5 text-sm bg-[#F6F8F7] border border-[#64748B] rounded-lg font-bold text-[#0B1F33] flex items-center justify-center tabular-nums">
                      +91
                    </div>
                    <input
                      id="mobile-input"
                      type="tel"
                      required
                      placeholder="98765 43210"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setPhoneNumber(val);
                      }}
                      className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-[#64748B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] text-[#0B1F33] font-mono tracking-wider"
                    />
                    <button
                      type="button"
                      disabled={phoneNumber.length < 10 || isSendingOtp || otpTimer > 0}
                      onClick={handleSendOtp}
                      className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                        phoneNumber.length >= 10 && !isSendingOtp && otpTimer === 0
                          ? 'bg-[#0F766E] text-white hover:bg-[#0D655E]'
                          : 'bg-[#D5DCE0] text-[#64748B] cursor-not-allowed'
                      }`}
                    >
                      {isSendingOtp
                        ? 'Sending...'
                        : otpTimer > 0
                        ? `Wait ${otpTimer}s`
                        : otpSent
                        ? 'Resend OTP'
                        : 'Send OTP'}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#475569] mt-1">
                    Standard 10-digit Indian mobile number.
                  </p>
                </div>

                {/* OTP Input Field (Shows after OTP is dispatched) */}
                {otpSent && (
                  <div className="p-4 bg-[#F6F8F7] border border-[#0F766E]/40 rounded-lg space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="otp-code"
                        className="block text-xs font-bold text-[#0B1F33] uppercase tracking-wider"
                      >
                        Enter 4-Digit OTP Code <span className="text-[#D92D20]">*</span>
                      </label>
                      <span className="text-xs text-[#0F766E] font-medium bg-[#E8F0EE] px-2 py-0.5 rounded">
                        Demo Auto-fill: 4829
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        id="otp-code"
                        type="text"
                        maxLength={4}
                        placeholder="4829"
                        value={otpCode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setOtpCode(val);
                        }}
                        className="w-36 px-4 py-2 text-center text-lg font-mono font-bold tracking-widest bg-white border-2 border-[#0F766E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F766E] text-[#0B1F33]"
                      />
                      <span className="text-xs text-[#475569]">
                        Sent to +91 {phoneNumber.slice(0, 2)}******{phoneNumber.slice(-2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-[#64748B] text-xs font-bold text-[#475569] hover:bg-[#F6F8F7] hover:text-[#0B1F33] transition-colors cursor-pointer"
                  >
                    Back to Form
                  </button>

                  <button
                    type="submit"
                    disabled={!otpSent || otpCode.length < 4 || isVerifying}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                      otpSent && otpCode.length >= 4 && !isVerifying
                        ? 'bg-[#0F766E] text-white hover:bg-[#0D655E] cursor-pointer shadow-sm'
                        : 'bg-[#9CC4C1] text-white cursor-not-allowed'
                    }`}
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying & Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify & Submit Report</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: Instant Digital Receipt (Success State) */}
          {/* ============================================================ */}
          {currentStep === 3 && receiptData && (
            <div className="space-y-5 animate-fadeIn">
              {/* Large Success Hero Banner */}
              <div className="text-center py-3 px-4 bg-[#E8F0EE] border border-[#0F766E]/30 rounded-xl space-y-2">
                <div className="w-12 h-12 bg-[#15803D] text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold font-serif text-[#0B1F33]">
                  Information Successfully Transmitted
                </h2>
                <p className="text-xs text-[#475569] max-w-md mx-auto">
                  Your sighting has been logged securely and routed to the jurisdictional police department.
                  Keep this digital receipt for reference.
                </p>
              </div>

              {/* Official Digital Receipt Card */}
              <div className="bg-white border-2 border-[#D5DCE0] rounded-xl p-5 shadow-sm space-y-4 font-sans text-xs">
                {/* Receipt Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D5DCE0] gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] block">
                      Averti Official Citizen Receipt ID
                    </span>
                    <span className="text-xl font-mono font-bold text-[#0F766E] tabular-nums">
                      {receiptData.receiptId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyReceipt}
                      className="px-3 py-1.5 rounded-md border border-[#64748B] bg-[#F6F8F7] hover:bg-white text-[#0B1F33] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedReceipt ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#15803D]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Receipt</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sighting Details Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 tabular-nums">
                  <div>
                    <span className="text-[#64748B] block text-[11px]">Notice Target</span>
                    <span className="font-bold text-[#0B1F33] block text-xs">
                      {receiptData.noticeRef}
                    </span>
                    <span className="text-[#475569] text-[11px] block truncate">
                      {receiptData.noticeTitle}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#64748B] block text-[11px]">Investigating Authority</span>
                    <span className="font-bold text-[#0B1F33] block text-xs">
                      {receiptData.issuingAuthority}
                    </span>
                    <span className="text-[#475569] text-[11px] block">
                      {receiptData.jurisdiction}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#64748B] block text-[11px]">Recorded Sighting Time</span>
                    <span className="font-bold text-[#0B1F33] block text-xs">
                      {receiptData.sightingDateTime}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#64748B] block text-[11px]">Locality & Landmark</span>
                    <span className="font-bold text-[#0B1F33] block text-xs">
                      {receiptData.landmark}
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[#64748B] block text-[11px]">Provided Description</span>
                    <span className="text-[#0B1F33] block bg-[#F6F8F7] p-2.5 rounded border border-[#D5DCE0] mt-0.5 leading-relaxed text-xs">
                      {receiptData.description}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#64748B] block text-[11px]">Verified Citizen Mobile</span>
                    <span className="font-mono font-bold text-[#0B1F33] block text-xs">
                      {receiptData.verifiedPhone}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#64748B] block text-[11px]">Submission Timestamp</span>
                    <span className="font-mono text-[#0B1F33] block text-xs">
                      {receiptData.submittedAt}
                    </span>
                  </div>
                </div>

                {/* Simulated Live Triage Status */}
                <div className="p-3.5 rounded-lg bg-[#F6F8F7] border border-[#D5DCE0] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      Current Investigation Intake Status:
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#B45309] border border-[#B45309]/30">
                      <span className="w-2 h-2 rounded-full bg-[#B45309] animate-pulse" />
                      {simulatedLiveStatus}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#475569] leading-relaxed">
                    This tip has entered the <strong>District Police Triage Queue</strong>. If officers require further clarification, they will contact you directly via your verified mobile number.
                  </div>

                  {/* Interactive Status Simulation toggles for presentation */}
                  <div className="pt-2 border-t border-[#D5DCE0] flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-[#64748B] font-semibold">
                      Simulate Status Update:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSimulatedLiveStatus('Pending Police Triage')}
                      className="px-2 py-0.5 text-[10px] rounded bg-white border border-[#D5DCE0] hover:bg-[#E8F0EE] text-[#0B1F33] font-medium cursor-pointer"
                    >
                      Pending Triage
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimulatedLiveStatus('Forwarded to Investigating Officer')}
                      className="px-2 py-0.5 text-[10px] rounded bg-white border border-[#D5DCE0] hover:bg-[#E8F0EE] text-[#0F766E] font-medium cursor-pointer"
                    >
                      Forwarded to Station
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimulatedLiveStatus('Merged with Existing Sighting Cluster')}
                      className="px-2 py-0.5 text-[10px] rounded bg-white border border-[#D5DCE0] hover:bg-[#E8F0EE] text-[#64748B] font-medium cursor-pointer"
                    >
                      Merged Cluster
                    </button>
                  </div>
                </div>
              </div>

              {/* Legal & Civic Guardrail Notice */}
              <div className="bg-[#FFFBEB] border border-[#B45309]/40 rounded-lg p-3 text-[11px] text-[#0B1F33] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                <div>
                  <strong>Legal Privacy Guarantee:</strong> Averti operates as an independent civic atlas.
                  Your report has not been published anywhere on the web. Only authorized police officers with
                  accredited credentials in the District Triage System have access to this transmission.
                </div>
              </div>

              {/* Close / Done Action */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#0F766E] text-white hover:bg-[#0D655E] font-bold text-sm transition-colors cursor-pointer"
                >
                  Close & Return to Atlas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default NoticeTipModal;
