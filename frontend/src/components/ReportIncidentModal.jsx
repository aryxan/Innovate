import React, { useState, useEffect } from 'react';

const ReportIncidentModal = ({ isOpen, onClose, onSubmit, initialLocation }) => {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP Verification
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    issueType: 'Blocked Drain',
    severity: 'Medium',
    description: '',
    lat: null,
    lng: null,
  });
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationMethod, setLocationMethod] = useState('auto'); // 'auto' or 'manual'
  const [locationName, setLocationName] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      setFormData(prev => ({
        ...prev,
        lat: initialLocation.lat,
        lng: initialLocation.lng
      }));
      setLocationMethod('manual');
      reverseGeocode(initialLocation.lat, initialLocation.lng);
    }
  }, [initialLocation]);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`
      );
      const data = await response.json();
      if (data.display_name) {
        setLocationName(data.display_name);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude
        }));
        setLocationMethod('auto');
        await reverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        alert('Unable to retrieve your location. Please try again or select on map.');
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.lat || !formData.lng) {
      alert('Please provide a location by using "Get My Location" or clicking on the map');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please provide a description of the issue');
      return;
    }

    if (!formData.mobile || formData.mobile.length !== 10) {
      alert('Please provide a valid 10-digit mobile number');
      return;
    }

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    console.log('Generated OTP:', otp); // In production, send via SMS
    alert(`OTP sent to ${formData.mobile}: ${otp} (Demo mode - check console)`);
    setStep(2);
  };

  const handleVerifyOtp = () => {
    setIsVerifying(true);
    setOtpError('');

    setTimeout(() => {
      if (otp === generatedOtp) {
        // Generate unique complaint number
        const complaintNumber = `JR${Date.now().toString().slice(-8)}`;
        
        const complaintData = {
          ...formData,
          id: Date.now(),
          complaintNumber,
          created_at: new Date().toISOString(),
          status: 'pending',
          verified: true
        };

        onSubmit(complaintData);

        // Show success with complaint number
        alert(`✅ Complaint Registered Successfully!\n\nYour Complaint Number: ${complaintNumber}\n\nPlease save this number to track your complaint status.`);

        // Reset form
        setFormData({
          name: '',
          mobile: '',
          issueType: 'Blocked Drain',
          severity: 'Medium',
          description: '',
          lat: null,
          lng: null,
        });
        setOtp('');
        setGeneratedOtp('');
        setLocationName('');
        setLocationMethod('auto');
        setStep(1);
      } else {
        setOtpError('Invalid OTP. Please try again.');
      }
      setIsVerifying(false);
    }, 1000);
  };

  const handleResendOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    console.log('Resent OTP:', otp);
    alert(`OTP resent to ${formData.mobile}: ${otp} (Demo mode - check console)`);
    setOtpError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  const issueTypes = [
    'Blocked Drain',
    'Overflowing Drain',
    'Waterlogging',
    'River Rising',
    'Road Flooding',
    'Bridge Damage',
    'Other'
  ];

  const severityLevels = ['Low', 'Medium', 'High'];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'Medium': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
      case 'Low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 p-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Report Incident</h2>
                <p className="text-sm text-gray-400">Help us track flood-related issues in your area</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {step === 1 ? (
            <>
              {/* Name (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Anonymous Reporter"
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Mobile Number (Required) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  placeholder="Enter 10-digit mobile number"
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <div className="text-xs text-gray-500 mt-1">
                  OTP will be sent to this number for verification
                </div>
              </div>

          {/* Issue Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Issue Type <span className="text-red-400">*</span>
            </label>
            <select
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              required
              className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              {issueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Severity Level <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {severityLevels.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, severity: level }))}
                  className={`px-4 py-3 rounded-lg border font-semibold transition-all ${
                    formData.severity === level
                      ? getSeverityColor(level)
                      : 'bg-slate-800/30 border-slate-700/50 text-gray-400 hover:bg-slate-800/60'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location <span className="text-red-400">*</span>
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
              >
                {isLocating ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Getting Location...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Get My Location</span>
                  </>
                )}
              </button>

              {locationName && (
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-1">Location Detected</div>
                    <div className="text-sm text-white">{locationName}</div>
                  </div>
                </div>
              )}

              <div className="text-center text-sm text-gray-500">
                or click on the map to select location
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the issue in detail... (e.g., Water level, affected area, urgency)"
              className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.description.length} / 500 characters
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800/60 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-slate-700/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20"
            >
              Send OTP
            </button>
          </div>
            </>
          ) : (
            <>
              {/* OTP Verification Step */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Verify Your Mobile Number</h3>
                <p className="text-gray-400 text-sm">
                  We've sent a 6-digit OTP to <span className="text-white font-semibold">{formData.mobile}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-center">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setOtpError('');
                  }}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-4 py-4 text-white text-center text-2xl font-mono tracking-widest placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {otpError && (
                  <div className="mt-2 text-red-400 text-sm text-center flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {otpError}
                  </div>
                )}
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Didn't receive OTP? Resend
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setOtpError('');
                  }}
                  className="flex-1 bg-slate-800/60 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-slate-700/50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 6 || isVerifying}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Submit'
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ReportIncidentModal;
