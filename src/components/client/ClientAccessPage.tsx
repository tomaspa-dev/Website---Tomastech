import React, { useState } from 'react';
import LiquidBackground from './LiquidBackground';
import LoginForm from './LoginForm';

export default function ClientAccessPage() {
  const [distortionState, setDistortionState] = useState<'idle' | 'hover' | 'active'>('idle');

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      <LiquidBackground />
      <LoginForm 
        onUnlock={() => setDistortionState('active')}
        onButtonHover={() => setDistortionState('hover')}
        onButtonLeave={() => setDistortionState('idle')}
      />
    </div>
  );
}
