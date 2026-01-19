document.addEventListener('DOMContentLoaded', () => {
    // Generate twinkling stars
    const starsContainer = document.querySelector('.stars-container');
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.innerHTML = '✦';
        star.style.position = 'absolute';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.color = Math.random() > 0.5 ? '#ff99cc' : '#99e6ff';
        star.style.fontSize = (Math.random() * 15 + 10) + 'px';
        star.style.opacity = Math.random();
        star.style.animation = `twinkle ${Math.random() * 3 + 2}s infinite alternate`;
        starsContainer.appendChild(star);
    }

    // Twinkle animation keyframes
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes twinkle {
            from { opacity: 0.2; transform: scale(0.8); }
            to { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);

    // Bounce effect for main title
    const heroTitle = document.querySelector('.hero h1');
    heroTitle.style.animation = 'bounce 3s infinite ease-in-out';

    // Scroll reveal for Pop Cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'scale(1)';
            }
        });
    }, { threshold: 0.1 });

    const popCards = document.querySelectorAll('.pop-card');
    popCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        observer.observe(card);
    });

    // Mouse interactive floating (Subtle)
    const hero = document.querySelector('.hero');
    hero.addEventListener('mousemove', (e) => {
        const x = (e.clientX - window.innerWidth / 2) / 30;
        const y = (e.clientY - window.innerHeight / 2) / 30;

        const catContainer = document.querySelector('.cat-sticker-container');
        if (catContainer) {
            catContainer.style.transform = `rotate(10deg) translate(${x}px, ${y}px)`;
        }
    });

    // Button click "Pop" sound simulation (Visual)
    const jellyBtns = document.querySelectorAll('.btn-jelly');
    jellyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                btn.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    btn.style.transform = 'scale(1)';
                }, 100);
            }, 100);
        });
    });
});
