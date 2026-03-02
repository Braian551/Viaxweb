import React, { useRef, useEffect } from 'react';
import './OtpInput.css';

const OtpInput = ({ length = 4, value, onChange }) => {
    const inputRefs = useRef([]);

    // Initialize array of given length
    const otpArray = Array.from({ length }, (_, i) => value[i] || '');

    const handleChange = (e, index) => {
        const val = e.target.value;
        if (!/^[0-9]?$/.test(val)) return;

        const newOtp = [...otpArray];
        newOtp[index] = val;
        onChange(newOtp.join(''));

        // Move to next input if value is entered
        if (val && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!otpArray[index] && index > 0) {
                // If current is empty and backspace is pressed, focus previous and clear it
                const newOtp = [...otpArray];
                newOtp[index - 1] = '';
                onChange(newOtp.join(''));
                inputRefs.current[index - 1].focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
        if (pastedData) {
            onChange(pastedData);
            const focusIndex = Math.min(pastedData.length, length - 1);
            inputRefs.current[focusIndex].focus();
        }
    };

    return (
        <div className="otp-input-container">
            {otpArray.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    className={`otp-input-box ${digit ? 'filled' : ''}`}
                    placeholder="-"
                />
            ))}
        </div>
    );
};

export default OtpInput;
