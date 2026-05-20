"use client"

import React, { useState } from "react"
import LoginView from "./login-view"
import SignupView from "./signup-view"
import ForgotPasswordView from "./forgot-password-view"

interface ThemedAuthWrapperProps {
  onSuccess: (user: any) => void
  initialView?: 'login' | 'signup'
}

export default function ThemedAuthWrapper({ onSuccess, initialView = 'login' }: ThemedAuthWrapperProps) {
  const [view, setView] = useState<'login' | 'signup' | 'forgot-password'>(initialView)

  const handleSuccess = (user: any) => {
    onSuccess(user)
  }

  if (view === 'login') {
    return (
      <LoginView 
        onSuccess={handleSuccess}
        onSwitchToSignup={() => setView('signup')}
        onForgotPassword={() => setView('forgot-password')}
      />
    )
  }

  if (view === 'signup') {
    return (
      <SignupView 
        onSuccess={handleSuccess}
        onSwitchToLogin={() => setView('login')}
      />
    )
  }

  return (
    <ForgotPasswordView 
      onBackToLogin={() => setView('login')}
    />
  )
}
