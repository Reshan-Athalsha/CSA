import { useState } from 'react';
import collections from '@/api/supabaseClient';
import { Waves, Trophy, Users, Star, ChevronDown, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';

/* ── reusable wave divider ─────────────────────────────────────────────── */
function WaveDivider({ fill, flip = false, style = 1 }) {
  const paths = {
    1: 'M0,32 C240,80 480,0 720,40 C960,80 1200,10 1440,48 L1440,80 L0,80 Z',
    2: 'M0,60 C200,20 400,70 600,40 C800,10 1000,65 1200,35 C1320,18 1380,50 1440,40 L1440,80 L0,80 Z',
    3: 'M0,20 C120,60 300,0 500,35 C700,70 900,10 1100,45 C1250,68 1380,25 1440,50 L1440,80 L0,80 Z',
  };
  return (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden" style={{ lineHeight: 0, transform: flip ? 'scaleX(-1)' : undefined }}>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 72 }}>
        <path d={paths[style]} fill={fill} />
      </svg>
    </div>
  );
}

export default function Landing() {
  const [form, setForm] = useState({
    parent_name: '', child_name: '', child_age: '', email: '', phone: '',
    swimming_experience: 'None', message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await collections.trialrequests.create({ ...form, child_age: Number(form.child_age) });
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#03045e' }}>
      <style>{`
        :root {
          --color-bg-primary: #caf0f8;
          --color-bg-secondary: #ade8f4;
          --color-card: #90e0ef;
          --color-accent-light: #48cae4;
          --color-accent-main: #00b4d8;
          --color-primary: #0096c7;
          --color-primary-dark: #0077b6;
          --color-text-header: #023e8a;
          --color-text-main: #03045e;
        }

        @keyframes float-up {
          0%   { transform: translateY(0)   scale(1);   opacity: 0.7; }
          100% { transform: translateY(-120px) scale(1.3); opacity: 0; }
        }
        @keyframes sway {
          0%,100% { transform: translateX(0); }
          50%     { transform: translateX(18px); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0,180,216,0.55); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 18px rgba(0,180,216,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0,180,216,0); }
        }
        @keyframes shimmer-border {
          0%   { border-color: #00b4d8; box-shadow: 0 0 0 4px rgba(0,180,216,0.3), 0 0 40px rgba(0,180,216,0.2); }
          50%  { border-color: #48cae4; box-shadow: 0 0 0 8px rgba(72,202,228,0.2), 0 0 60px rgba(72,202,228,0.35); }
          100% { border-color: #00b4d8; box-shadow: 0 0 0 4px rgba(0,180,216,0.3), 0 0 40px rgba(0,180,216,0.2); }
        }
        @keyframes wave-bg {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes drift {
          0%,100% { transform: translateY(0) rotate(0deg); }
          33%     { transform: translateY(-20px) rotate(3deg); }
          66%     { transform: translateY(-8px) rotate(-2deg); }
        }
        .bubble {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), rgba(0,180,216,0.1));
          border: 1px solid rgba(255,255,255,0.25);
          animation: float-up linear infinite;
          pointer-events: none;
        }
        .coach-photo {
          animation: shimmer-border 3s ease-in-out infinite;
        }
        .hero-grad {
          background: linear-gradient(160deg, #03045e 0%, #0077b6 50%, #00b4d8 100%);
          background-size: 200% 200%;
          animation: wave-bg 10s ease infinite;
        }
      `}</style>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-[#03045e]/80 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#00b4d8] flex items-center justify-center font-black text-white text-sm shadow">CSA</div>
          <span className="font-bold text-white text-sm hidden sm:block">Ceylon Swimming Academy</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#trial" className="text-[#90e0ef] text-sm hover:text-white transition font-medium hidden sm:block">Request Trial</a>
          <a href="/Signup" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold transition">Sign Up</a>
          <a href="/Login" className="px-4 py-2 rounded-xl bg-[#00b4d8] hover:bg-[#0096c7] text-white text-sm font-semibold transition shadow">Sign In</a>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="hero-grad relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-28 overflow-hidden">
        {/* glow orbs */}
        <div className="absolute top-1/4 left-1/5 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: '#00b4d8' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: '#48cae4' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-2xl pointer-events-none" style={{ background: '#caf0f8' }} />

        {/* floating bubbles */}
        {[
          { size: 18, left: '12%',  bottom: '18%', dur: '6s',  delay: '0s'  },
          { size: 10, left: '22%',  bottom: '30%', dur: '8s',  delay: '1s'  },
          { size: 24, left: '75%',  bottom: '22%', dur: '7s',  delay: '2s'  },
          { size: 14, left: '85%',  bottom: '40%', dur: '9s',  delay: '0.5s'},
          { size: 8,  left: '50%',  bottom: '15%', dur: '5s',  delay: '3s'  },
          { size: 20, left: '60%',  bottom: '35%', dur: '10s', delay: '1.5s'},
          { size: 12, left: '35%',  bottom: '10%', dur: '7.5s',delay: '4s'  },
        ].map((b, i) => (
          <span key={i} className="bubble" style={{
            width: b.size, height: b.size,
            left: b.left, bottom: b.bottom,
            animationDuration: b.dur, animationDelay: b.delay,
          }} />
        ))}

        <div className="relative text-center max-w-3xl z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#90e0ef] text-xs font-semibold mb-6 backdrop-blur-sm">
            <Waves className="h-3.5 w-3.5" /> Sri Lanka's Premier Swim Academy
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-4 drop-shadow-2xl">
            Ceylon Swimming<br /><span className="text-[#48cae4]">Academy</span>
          </h1>
          <p className="text-[#ade8f4] text-base sm:text-lg max-w-xl mx-auto mb-3">
            Training swimmers from beginner to elite under <strong className="text-white">Head Coach Indika Hewage</strong>
          </p>
          <p className="text-[#90e0ef] text-sm mb-10">Building champions in the water, one stroke at a time.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#trial"
              className="px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl transition hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,180,216,0.5)]"
              style={{ background: 'linear-gradient(135deg,#00b4d8,#0077b6)' }}>
              Request a Free Trial →
            </a>
            <a href="/Signup"
              className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition hover:-translate-y-0.5 backdrop-blur-sm">
              Sign Up
            </a>
            <a href="/Login"
              className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition hover:-translate-y-0.5 backdrop-blur-sm">
              Member Login
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 mt-16 grid grid-cols-3 gap-4 sm:gap-14 max-w-lg w-full">
          {[['100+', 'Active Swimmers'], ['15+', 'National Medals'], ['3', 'Squad Levels']].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">{n}</div>
              <div className="text-[10px] sm:text-xs text-[#90e0ef] mt-0.5">{l}</div>
            </div>
          ))}
        </div>

        <a href="#coach" className="absolute bottom-20 left-1/2 -translate-x-1/2 animate-bounce text-[#90e0ef] z-10">
          <ChevronDown className="h-6 w-6" />
        </a>

        {/* Wave into coach section */}
        <WaveDivider fill="#03045e" style={1} />
      </section>

      {/* ═══ HEAD COACH ═══ */}
      <section id="coach" className="relative pt-4 pb-28 px-6 overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#03045e 0%,#023e8a 50%,#0077b6 100%)' }}>
        {/* decorative ripple rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-white/5 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#90e0ef] text-xs font-semibold mb-4 backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 fill-[#90e0ef]" /> Meet Your Head Coach
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">The Coach Behind the Champions</h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-center bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 backdrop-blur-md shadow-2xl">
            {/* Photo + badges */}
            <div className="flex-shrink-0 flex flex-col items-center gap-5">
              <div className="relative" style={{ animation: 'drift 6s ease-in-out infinite' }}>
                {/* multiple glow rings */}
                <div className="absolute inset-0 rounded-full opacity-30 blur-2xl" style={{ background: '#00b4d8', transform: 'scale(1.3)' }} />
                <div className="absolute inset-0 rounded-full opacity-15 blur-3xl" style={{ background: '#48cae4', transform: 'scale(1.6)' }} />
                <img
                  src="/coach.png"
                  alt="Head Coach Indika Hewage"
                  className="coach-photo relative w-52 h-52 sm:w-64 sm:h-64 rounded-full object-cover border-4 shadow-2xl"
                  style={{ borderColor: '#00b4d8' }}
                />
                {/* floating badge */}
                <div className="absolute -bottom-3 -right-3 bg-[#00b4d8] text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg border-2 border-[#03045e]">
                  HEAD COACH
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-[220px] mt-4">
                {[
                  { label: 'Level 2 Certified Coach', color: '#00b4d8' },
                  { label: 'SLASA Accredited', color: '#0096c7' },
                  { label: '10+ Years Experience', color: '#0077b6' },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-2 px-3 py-2 rounded-xl text-white text-xs font-semibold shadow-lg"
                    style={{ background: `linear-gradient(135deg,${b.color},${b.color}cc)` }}>
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {b.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="flex-1 text-center lg:text-left">
              <h3 className="text-3xl sm:text-4xl font-black text-white mb-1 drop-shadow">Indika Hewage</h3>
              <p className="text-[#48cae4] font-semibold text-sm mb-6 tracking-wide uppercase">Head Coach · Ceylon Swimming Academy</p>

              <p className="text-[#caf0f8] text-sm leading-relaxed mb-4">
                Coach Indika Hewage is a <strong className="text-white">Level 2 certified swimming coach</strong> accredited by
                Sri Lanka Aquatic Sports Association (SLASA) and affiliated with FINA international standards.
                With over a decade of hands-on coaching experience, he has guided swimmers of all ages — from
                first-time learners to national-level competitors.
              </p>
              <p className="text-[#ade8f4] text-sm leading-relaxed mb-8">
                His training philosophy centres on building discipline, technique, and mental resilience in the
                water. Under his guidance, CSA athletes have earned medals at district and national championships,
                with several representing Sri Lanka at regional aquatic events.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { stat: 'Level 2', sub: 'SLASA Coaching Cert.' },
                  { stat: '100+', sub: 'Swimmers Trained' },
                  { stat: '15+', sub: 'National Medals' },
                ].map(c => (
                  <div key={c.sub} className="rounded-2xl p-4 text-center border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition">
                    <div className="text-xl font-black text-white">{c.stat}</div>
                    <div className="text-[10px] text-[#90e0ef] mt-0.5">{c.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Wave into squads */}
        <WaveDivider fill="#caf0f8" style={2} flip />
      </section>

      {/* ═══ SQUADS ═══ */}
      <section id="about" className="relative pt-4 pb-28 px-6 overflow-hidden" style={{ background: '#caf0f8' }}>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black" style={{ color: 'var(--color-text-header)' }}>Our Training Squads</h2>
            <p className="text-sm mt-2" style={{ color: 'var(--color-primary-dark)' }}>Structured programs for every level of swimmer</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { level: 'Beginner', age: 'Ages 5–10', desc: 'Water confidence, basic strokes, safety. Fun-focused sessions building a love for swimming.', color: '#48cae4', icon: '🐬' },
              { level: 'Intermediate', age: 'Ages 10–15', desc: 'Technique refinement, stroke efficiency, competitive awareness and first race experiences.', color: '#0096c7', icon: '🏊' },
              { level: 'Elite', age: 'Ages 12+', desc: 'High-performance training, national competition preparation, strength & conditioning.', color: '#023e8a', icon: '🏆' },
            ].map((s) => (
              <div key={s.level} className="rounded-2xl p-6 bg-white shadow-md hover:shadow-2xl transition hover:-translate-y-2 border-t-4" style={{ borderColor: s.color }}>
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="font-black text-lg mb-0.5" style={{ color: s.color }}>{s.level}</div>
                <div className="text-xs font-semibold text-gray-500 mb-3">{s.age}</div>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave into features */}
        <WaveDivider fill="#ffffff" style={3} />
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="relative pt-4 pb-28 px-6 overflow-hidden bg-white">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black" style={{ color: 'var(--color-text-header)' }}>Why CSA?</h2>
            <p className="text-sm mt-2 text-gray-400">Everything you need to become a champion swimmer</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Trophy, title: 'Proven Results', desc: 'National & district medalists trained under our program.' },
              { icon: Users, title: 'Expert Coaches', desc: 'Qualified, experienced coaching staff led by Head Coach Indika Hewage.' },
              { icon: Star, title: 'Modern Facility', desc: 'Olympic-standard pool with the latest training equipment.' },
              { icon: Waves, title: 'All Ages', desc: 'From first splashes to competitive racing — we welcome all swimmers.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-[#ade8f4] bg-[#f0fbff] text-center hover:shadow-xl hover:-translate-y-1 transition">
                <div className="h-12 w-12 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-md"
                  style={{ background: 'linear-gradient(135deg,#00b4d8,#0077b6)' }}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="font-bold text-sm mb-1" style={{ color: 'var(--color-text-header)' }}>{title}</div>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave into trial */}
        <WaveDivider fill="#ade8f4" style={1} flip />
      </section>

      {/* ═══ TRIAL FORM ═══ */}
      <section id="trial" className="relative pt-4 pb-28 px-6 overflow-hidden" style={{ background: '#ade8f4' }}>
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black" style={{ color: 'var(--color-text-header)' }}>Book a Free Trial</h2>
            <p className="text-sm mt-2" style={{ color: 'var(--color-primary-dark)' }}>No commitment. Just come and swim with us!</p>
          </div>
          {submitted ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-lg">
              <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: '#0096c7' }} />
              <h3 className="text-xl font-black mb-2" style={{ color: 'var(--color-text-header)' }}>Request Received!</h3>
              <p className="text-sm text-gray-500">We'll contact you within 24–48 hours to schedule your trial session.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Parent/Guardian Name *</label>
                  <input required className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" style={{ borderColor: '#ade8f4' }}
                    value={form.parent_name} onChange={e => setForm({ ...form, parent_name: e.target.value })} placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Child's Name *</label>
                  <input required className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" style={{ borderColor: '#ade8f4' }}
                    value={form.child_name} onChange={e => setForm({ ...form, child_name: e.target.value })} placeholder="Child's full name" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Child's Age</label>
                  <input type="number" min="3" max="25" className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" style={{ borderColor: '#ade8f4' }}
                    value={form.child_age} onChange={e => setForm({ ...form, child_age: e.target.value })} placeholder="Age" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Swimming Experience</label>
                  <select className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white focus:ring-2 focus:ring-[#00b4d8]" style={{ borderColor: '#ade8f4' }}
                    value={form.swimming_experience} onChange={e => setForm({ ...form, swimming_experience: e.target.value })}>
                    {['None', 'Basic', 'Intermediate', 'Advanced'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Email *</label>
                  <input required type="email" className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" style={{ borderColor: '#ade8f4' }}
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Phone *</label>
                  <input required className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8]" style={{ borderColor: '#ade8f4' }}
                    value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+94 77 123 4567" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--color-text-header)' }}>Message (optional)</label>
                <textarea rows={3} className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none focus:ring-2 focus:ring-[#00b4d8]" style={{ borderColor: '#ade8f4' }}
                  value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Any additional information..." />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition hover:opacity-90 disabled:opacity-60 shadow-lg hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#00b4d8,#0077b6)' }}>
                {submitting ? 'Submitting…' : 'Request My Free Trial →'}
              </button>
            </form>
          )}
        </div>

        {/* Wave into footer */}
        <WaveDivider fill="#03045e" style={2} />
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-10 px-6" style={{ backgroundColor: '#03045e' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#00b4d8] flex items-center justify-center font-black text-white text-xs">CSA</div>
            <span className="font-bold text-white text-sm">Ceylon Swimming Academy</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs text-[#90e0ef]">
            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> +94 77 000 0000</span>
            <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> info@csa.lk</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Colombo, Sri Lanka</span>
          </div>
          <p className="text-[#48cae4] text-xs">© 2026 CSA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}