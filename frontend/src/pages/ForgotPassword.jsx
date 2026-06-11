import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'warning');
      return;
    }

    setLoading(true);
    const res = await forgotPassword(email);
    setLoading(false);

    if (res.success) {
      setSubmitted(true);
      showToast('Reset email request simulated successfully!', 'success');
    } else {
      showToast(res.error, 'error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-blue-50 via-gray-50 to-indigo-50 px-4">
      <div className="w-full max-w-md scale-enter">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg shadow-primary/20 mb-4 animate-bounce-subtle">
            J
          </div>
          <h1 className="font-extrabold text-2xl text-gray-900 tracking-tight">JIM HOSTEL</h1>
          <p className="text-gray-500 text-sm mt-1">Attendance Management System</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary mb-6 transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Back to Sign In
          </Link>

          {!submitted ? (
            <>
              <h2 className="font-bold text-gray-800 text-lg mb-2">Forgot Password?</h2>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Enter your email address below. The system will simulate sending password reset instructions.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="username@jim.edu"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-all duration-300 shadow-md hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Requesting...</span>
                    </>
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-800 text-md mb-2">Request Processed!</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                Password reset logs were generated. Log in as <strong className="text-gray-700">Admin</strong> to view reset code notifications on the Topbar, or try logging in again.
              </p>
              <Link
                to="/login"
                className="inline-block w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-primary/20"
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
