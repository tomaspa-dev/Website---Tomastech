document.addEventListener("DOMContentLoaded", function() {
    gsap.to(".preloader-imgs > img", {
        clipPath: "polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)",
        duration: 1,
        ease: "power4.inOut",
        stagger: 0.25,
        delay: 2,
    });
    // gsap.to(".gallery-section", {
    //     scale: 1.25,
    //     duration: 3,
    //     ease: "power4.inOut",
    //     delay: 2,
    // });

    // gsap.to("gallery-section", {
    //     y: 0,
    //     duration: 1,
    //     ease: "power3.out",
    //     delay: 4,
    // });
});