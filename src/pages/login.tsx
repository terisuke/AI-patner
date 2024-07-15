import { useState, useEffect } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from 'next/router';
import { IconButton } from "../components/iconButton";
import { useTranslation } from 'react-i18next';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import KeyboardreturnIcon from '@mui/icons-material/KeyboardReturn';
import { auth } from '../lib/firebase'; // Firebaseの初期化をインポート
import React from "react";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const Login = () => {
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        router.push("/");
      }
    });
  }, [router]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      state: JSON.stringify({ previousRoute: router.pathname }) // 現在のルート情報を含める
    });
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignUpRedirect = () => {
    console.log("Redirecting to signUp page");
    router.push("/signup");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-900">{t('Login')}</h2>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex items-center justify-center">
          <IconButton
            iconName="24/Close" // デフォルトアイコン名を指定
            isProcessing={false}
            customIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            className="flex items-center px-4 py-2 space-x-2 font-bold text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-oval"
            label={t('Login with Google')}
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
          <div className="flex items-center justify-center">
            <IconButton
              iconName="24/Close"
              isProcessing={false}
              customIcon={<EmailIcon />}
              onClick={handleEmailLogin}
              className="flex items-center px-4 py-2 space-x-2 font-bold text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-oval"
              label= {t("Login with Email & Password")}
            />
          </div>
        </div>
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-center">
            <IconButton
              iconName="24/Close"
              isProcessing={false}
              customIcon={<KeyboardreturnIcon />}
              onClick={handleSignUpRedirect}
              className="flex items-center px-4 py-2 space-x-2 font-bold text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-oval"
              label = {t("Don't have an account?")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;