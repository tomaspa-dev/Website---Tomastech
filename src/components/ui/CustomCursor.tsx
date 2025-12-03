import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 }); // Start off-screen
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Track if mouse has moved

  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Check localStorage preference
    const storedPref = localStorage.getItem('customCursorEnabled');
    if (storedPref !== null) {
      setIsEnabled(storedPref === 'true');
    }

    // Listen for settings changes
    const handleSettingsChange = (e: CustomEvent) => {
      if (e.detail && typeof e.detail.enabled === 'boolean') {
        setIsEnabled(e.detail.enabled);
      }
    };

    window.addEventListener('cursor-settings-changed', handleSettingsChange as EventListener);

    return () => {
      window.removeEventListener('cursor-settings-changed', handleSettingsChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      document.body.style.cursor = 'auto';
      return;
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    // Check if cursor should be hidden based on route
    const checkRoute = () => {
      const path = window.location.pathname;
      const hiddenRoutes = ['/login', '/dashboard', '/client'];
      // Check if current path starts with any hidden route
      const shouldHide = hiddenRoutes.some(route => path.startsWith(route));
      
      if (shouldHide) {
        document.body.style.cursor = 'auto'; // Restore default cursor
      } else {
        document.body.style.cursor = 'none'; // Hide default cursor
      }
      return shouldHide;
    };

    // Initial check
    const isHidden = checkRoute();
    if (isHidden) return; // Don't add listeners if hidden

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.style.cursor = 'auto'; // Cleanup
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  // Return null if on hidden routes (simple check for render)
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.startsWith('/login') || path.startsWith('/dashboard') || path.startsWith('/client')) {
      return null;
    }
  }

  return (
    <div style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.3s ease' }}>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-primary rounded-full pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
          scale: isHovering ? 2.5 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.1
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-primary rounded-full pointer-events-none z-[9998] mix-blend-difference"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 25,
          mass: 0.2,
          delay: 0.05 // Lag effect
        }}
      />
    </div>
  );
}
