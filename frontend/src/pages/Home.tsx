import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto mt-12 text-center space-y-8">
      <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
        Your Voice. <span className="text-sky-500">Smarter Governance.</span>
      </h1>
      <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Report civic issues, track resolutions, and help build better communities through AI-powered governance.
      </p>
      <div className="flex justify-center gap-4 pt-4">
        <a href="/report" className="btn-primary text-lg px-8 py-3">Report an Issue</a>
        <a href="/dashboard" className="bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 px-8 py-3 rounded-lg font-medium transition-colors">
          Explore Dashboard
        </a>
      </div>
    </div>
  );
};

export default Home;
