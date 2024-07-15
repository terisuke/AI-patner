import { useState, useEffect } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from 'next/router';
import { IconButton } from "../components/iconButton";
import { useTranslation } from 'react-i18next';
import GoogleIcon from '@mui/icons-material/Google';
import { auth } from '../lib/firebase'; // Firebaseの初期化をインポート
import React from "react";
import EmailIcon from '@mui/icons-material/Email';
import KeyboardreturnIcon from '@mui/icons-material/KeyboardReturn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const SignUp = () => {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // パスワード表示の状態を追跡
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // 確認パスワード表示の状態を追跡
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        router.push("/");
      }
    });
  }, [router]);

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEmailSignUp = async () => {
    if (password !== confirmPassword) {
      setError(t("Passwords do not match"));
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };
    
  const handleLoginRedirect = () => {
    console.log("Redirecting to login page");
    router.push("/login");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-900">{t('Sign Up')}</h2>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex items-center justify-center">
          <IconButton
            iconName="24/Close" // デフォルトアイコン名を指定
            isProcessing={false}
            customIcon={<GoogleIcon />}
            onClick={handleGoogleSignUp}
            className="flex items-center px-4 py-2 space-x-2 font-bold text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-oval"
            label={t('Sign Up with Google')}
          />
        </div>
        <div className="mt-8 space-y-4">
          <input
            type="email"
            placeholder={t('Email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-12 my-5"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t('Password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-12 my-5"
            />
            <IconButton
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center px-4"
              customIcon={showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              iconName="24/Close"
              isProcessing={false}
            />
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t('Confirm Password')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-12 my-5"
            />
            <IconButton
              onClick={toggleConfirmPasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center px-4"
              customIcon={showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              iconName="24/Close"
              isProcessing={false}
            />
          </div>
          <div className="flex items-center justify-center">
          <IconButton
              iconName="24/Close"
              isProcessing={false}
              customIcon={<EmailIcon />}
              onClick={handleEmailSignUp}
              className="flex items-center px-4 py-2 space-x-2 font-bold text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-oval"
              label= {t('Sign Up with Email & Password')}
            />
          </div>
        </div>
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-center">
            <IconButton
                iconName="24/Close"
                isProcessing={false}
                customIcon={<KeyboardreturnIcon />}
                onClick={handleLoginRedirect}
                className="flex items-center px-4 py-2 space-x-2 font-bold text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-oval"
                label = {t("Already have an account?")}
              />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;