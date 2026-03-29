'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 2 State
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const [resendTimer, setResendTimer] = useState(0);

    // Step 3 State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleSendOTP = async (e, isResend = false) => {
        if (e) e.preventDefault();
        if (!email) {
            toast.error('Email is required');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (!res.ok) {
                if (data.isStaff) {
                    toast.error(data.message);
                    return;
                }
                throw new Error(data.error || 'Failed to send OTP');
            }

            toast.success(data.message);
            setStep(2);
            setResendTimer(60);
            setOtpDigits(['', '', '', '', '', '']);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const submitOTP = async (otpValue) => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpValue })
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Invalid OTP');
            }

            toast.success('OTP verified!');
            setResetToken(data.resetToken);
            setStep(3);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDigitChange = (index, value) => {
        if (!/^\d?$/.test(value)) return; // digits only
        const newDigits = [...otpDigits];
        newDigits[index] = value;
        setOtpDigits(newDigits);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 filled
        if (newDigits.every(d => d !== '') && value) {
            submitOTP(newDigits.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        // Backspace on empty → focus previous
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetToken, newPassword })
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }

            toast.success('Password reset successfully!');
            router.push('/login');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 bg-[#111111] rounded-2xl border border-[#333333]">
                {step === 1 && (
                    <form onSubmit={handleSendOTP} className="space-y-6 animate-fade-in">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-white mb-2">Reset Your Password</h1>
                            <p className="text-[#AAAAAA]">Enter your email address</p>
                        </div>

                        <div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="citizen@example.com"
                                required
                                className="w-full px-4 py-3 bg-[#222222] border border-[#333333] rounded-xl text-white focus:outline-none focus:border-[#F5A623] transition-colors"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#F5A623] hover:bg-[#E09612] text-black font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>

                        <div className="text-center">
                            <Link href="/login" className="text-[#AAAAAA] hover:text-[#F5A623] text-sm transition-colors">
                                ← Back to Login
                            </Link>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-white mb-2">Enter OTP</h1>
                            <p className="text-[#AAAAAA]">We sent a 6-digit code to {email}</p>
                        </div>

                        <div className="flex gap-3 justify-center my-6">
                            {otpDigits.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => inputRefs.current[i] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleDigitChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    disabled={loading}
                                    className="w-12 h-14 text-center text-2xl font-bold
                             bg-[#222222] border border-[#333333] rounded-[12px]
                             text-white focus:border-[#F5A623] focus:outline-none disabled:opacity-50"
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => submitOTP(otpDigits.join(''))}
                            disabled={loading || otpDigits.some(d => !d)}
                            className="w-full py-3 bg-[#F5A623] hover:bg-[#E09612] text-black font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        <div className="text-center mt-4">
                            <button
                                onClick={(e) => handleSendOTP(null, true)}
                                disabled={resendTimer > 0 || loading}
                                className="text-sm text-[#AAAAAA] hover:text-[#F5A623] disabled:text-[#666666] disabled:hover:text-[#666666] transition-colors"
                            >
                                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword} className="space-y-6 animate-fade-in">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-white mb-2">Set New Password</h1>
                            <p className="text-[#AAAAAA]">Enter your new secure password</p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                                required
                                minLength={6}
                                className="w-full px-4 py-3 bg-[#222222] border border-[#333333] rounded-xl text-white focus:outline-none focus:border-[#F5A623] transition-colors"
                                disabled={loading}
                            />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                                required
                                minLength={6}
                                className="w-full px-4 py-3 bg-[#222222] border border-[#333333] rounded-xl text-white focus:outline-none focus:border-[#F5A623] transition-colors"
                                disabled={loading}
                            />
                            {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-red-400 text-xs">Passwords do not match</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || newPassword !== confirmPassword}
                            className="w-full py-3 bg-[#F5A623] hover:bg-[#E09612] text-black font-bold rounded-xl transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
