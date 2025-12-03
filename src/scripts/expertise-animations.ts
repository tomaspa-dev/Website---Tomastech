import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugin
gsap.registerPlugin(ScrollTrigger);

// Initialize when DOM is ready
function initExpertiseAnimations() {
  console.log('🎬 GSAP Expertise animations initializing...');

  // Rotating spinners on circles
  const circles = document.querySelectorAll('.journey-circle');
  console.log('📍 Found circles:', circles.length);
  
  if (circles.length === 0) {
    console.error('❌ No circles found! Check .journey-circle class');
    return;
  }
  
  circles.forEach((circle, index) => {
    const rotation = 360 * (index + 1);
    console.log(`🔄 Setting up rotation for circle ${index + 1}: ${rotation}deg`);
    
    gsap.to(circle, {
      rotation: rotation,
      ease: 'none',
      scrollTrigger: {
        trigger: "#expertise",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        markers: false,
        onUpdate: (self) => {
          if (index === 0) { // Only log for first circle to avoid spam
            console.log(`📊 Scroll progress: ${(self.progress * 100).toFixed(1)}%`);
          }
        }
      }
    });
  });

  // Content fade and scale
  const contents = document.querySelectorAll('.journey-content');
  console.log('📝 Found content blocks:', contents.length);
  
  contents.forEach((content, index) => {
    gsap.fromTo(content,
      { opacity: 0, scale: 0.9, y: 30 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: content,
          start: 'top 85%',
          end: 'top 50%',
          scrub: 1,
          markers: false,
          onEnter: () => console.log(`✨ Content ${index + 1} entering viewport`),
        }
      }
    );
  });

  console.log('✅ GSAP Expertise animations initialized successfully');
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExpertiseAnimations);
} else {
  initExpertiseAnimations();
}
