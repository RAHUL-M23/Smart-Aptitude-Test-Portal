import { useEffect, useRef } from 'react';

export default function LandingDashboard({ onNavigateToLogin, onNavigateToRegister }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let particles = [];
    const maxParticles = 90;
    const connectionDistance = 110;
    const mouse = { x: null, y: null, radius: 150 };

    // Match device pixel ratio for sharp canvas rendering
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      initParticles();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        // Moderate speeds for a calm drifting effect
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.baseX = this.x;
        this.baseY = this.y;
        this.wobbleSpeed = Math.random() * 0.02 + 0.01;
        this.wobbleAmount = Math.random() * 1.5 + 0.5;
        this.angle = Math.random() * Math.PI * 2;
      }

      update() {
        // Wobble drift movement
        this.angle += this.wobbleSpeed;
        this.x += this.vx + Math.sin(this.angle) * 0.1;
        this.y += this.vy + Math.cos(this.angle) * 0.1;

        // Bounce off canvas boundaries
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

        // Mouse hover interaction: gentle push/wobble effect
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.hypot(dx, dy);

          if (distance < mouse.radius) {
            // Calculate force vector
            const force = (mouse.radius - distance) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            // Move particle away from mouse slightly
            this.x -= Math.cos(angle) * force * 1.8;
            this.y -= Math.sin(angle) * force * 1.8;
          }
        }
      }

      draw() {
        // Detect theme via document body class
        const isLightTheme = document.body.classList.contains('light-theme');
        ctx.fillStyle = isLightTheme ? 'rgba(59, 130, 246, 0.45)' : 'rgba(96, 165, 250, 0.45)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
      }
    };

    const drawConnections = () => {
      const isLightTheme = document.body.classList.contains('light-theme');
      const lineColor = isLightTheme ? '59, 130, 246' : '96, 165, 250';

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < connectionDistance) {
            // Linear opacity scaling based on distance
            const alpha = (1 - dist / connectionDistance) * 0.18;
            ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }

        // Draw connections to the mouse as well
        if (mouse.x !== null && mouse.y !== null) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * 0.22;
            ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawConnections();
      
      animationFrameId = requestAnimationFrame(animate);
    };

    // Listeners for mouse tracking
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', resizeCanvas);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    resizeCanvas();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div className="landing-layout" style={{ position: 'relative', minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Particle Canvas */}
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
          zIndex: 1
        }}
      />

      {/* Main Content Area */}
      <div className="landing-content" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem 2rem', textAlign: 'center' }}>
        <div className="hero-section" style={{ maxWidth: '850px', marginBottom: '4rem' }}>
          <div className="badge-wrapper" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.4rem 1rem', borderRadius: '30px', color: 'var(--color-secondary)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-primary)' }}></span>
            Next-Gen Aptitude Evaluation
          </div>

          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.15', letterSpacing: '-0.03em', background: 'linear-gradient(135deg, var(--text-main) 30%, var(--color-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1.5rem' }}>
            Evaluate Cognitive Ability with High Fidelity
          </h1>
          
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '720px', margin: '0 auto 2.5rem auto' }}>
            A state-of-the-art aptitude testing portal with automated grading, randomized question pools, and strict real-time proctoring algorithms.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <button 
              className="btn-primary" 
              style={{ width: 'auto', minWidth: '220px', padding: '0.85rem 2rem', fontSize: '1rem', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)', boxShadow: '0 4px 20px rgba(59, 130, 246, 0.25)' }}
              onClick={onNavigateToLogin}
            >
              Launch Assessment Portal
            </button>
          </div>
        </div>

        {/* Feature Cards Showcase */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '1000px', zIndex: 3 }}>
          <div className="glass-card" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'transform 0.2s', cursor: 'default' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Quantitative Reasoning</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Evaluate numerical agility, percentages, time-speed relationships, and geometric mensuration using randomized pools.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'transform 0.2s', cursor: 'default' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(96, 165, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)', border: '1px solid rgba(96, 165, 250, 0.15)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Verbal Ability</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Test reading comprehension, word associations, tenses, vocabulary, grammar rules and spelling precision.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem', transition: 'transform 0.2s', cursor: 'default' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.15)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3zM6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z"></path></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Logical Reasoning</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Assess sequence patterns, family bloodlines, seating configurations, and syllogistic structures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
