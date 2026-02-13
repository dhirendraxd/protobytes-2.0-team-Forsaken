const FloatingParticles = () => {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      <style>{`
        @keyframes app-float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-45px) translateX(24px); }
          50% { transform: translateY(-80px) translateX(-20px); }
          75% { transform: translateY(-45px) translateX(18px); }
        }
        @keyframes app-float-slow {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
          33% { transform: translateY(-55px) translateX(28px) rotate(120deg); }
          66% { transform: translateY(-30px) translateX(-28px) rotate(240deg); }
        }
        @keyframes app-pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .app-particle { animation: app-float 11s infinite ease-in-out; }
        .app-particle-slow { animation: app-float-slow 14s infinite ease-in-out; }
        .app-particle-pulse { animation: app-pulse 7s infinite ease-in-out; }
      `}</style>

      <div className="app-particle absolute left-[5%] top-[10%] h-24 w-24 rounded-full bg-lime-300/25 blur-2xl" style={{ animationDelay: "0s" }} />
      <div className="app-particle-slow absolute right-[15%] top-[20%] h-32 w-32 rounded-full bg-lime-300/20 blur-3xl" style={{ animationDelay: "2s" }} />
      <div className="app-particle absolute bottom-[15%] left-[10%] h-28 w-28 rounded-full bg-lime-300/30 blur-2xl" style={{ animationDelay: "4s" }} />
      <div className="app-particle-pulse absolute right-[8%] top-[40%] h-40 w-40 rounded-full bg-lime-300/15 blur-3xl" style={{ animationDelay: "1s" }} />
      <div className="app-particle-slow absolute bottom-[30%] right-[20%] h-36 w-36 rounded-full bg-lime-300/25 blur-3xl" style={{ animationDelay: "3s" }} />

      <div className="app-particle absolute left-[20%] top-[60%] h-20 w-20 rounded-full bg-white/25 blur-xl" style={{ animationDelay: "1.5s" }} />
      <div className="app-particle-slow absolute left-[40%] top-[25%] h-24 w-24 rounded-full bg-white/20 blur-2xl" style={{ animationDelay: "3.5s" }} />
      <div className="app-particle-pulse absolute bottom-[40%] left-[35%] h-28 w-28 rounded-full bg-white/25 blur-2xl" style={{ animationDelay: "2.5s" }} />

      <div className="app-particle absolute right-[30%] top-[70%] h-16 w-16 rounded-full bg-black/10 blur-xl" style={{ animationDelay: "5s" }} />
      <div className="app-particle-slow absolute bottom-[20%] right-[40%] h-20 w-20 rounded-full bg-black/12 blur-2xl" style={{ animationDelay: "6s" }} />
    </div>
  );
};

export default FloatingParticles;
