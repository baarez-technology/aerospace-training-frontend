const fs = require('fs');

const files = [
  'app/src/app/trainee/knowledge/page.tsx',
  'app/src/app/trainee/digital-twin/page.tsx',
  'app/src/app/trainee/documents/page.tsx',
  'app/src/app/trainee/simulation/page.tsx',
  'app/src/app/trainee/progress/page.tsx' // Just in case
];

const map = {
  'bg-iaf-navy/60': 'bg-white',
  'bg-iaf-navy-dark': 'bg-slate-50',
  'bg-iaf-navy-light/30': 'bg-slate-50',
  'bg-iaf-navy-light/50': 'bg-slate-100',
  'bg-iaf-navy-light': 'bg-slate-100',
  'bg-iaf-navy': 'bg-white',
  'border-iaf-navy-light/30': 'border-slate-200',
  'border-iaf-navy-light/20': 'border-slate-100',
  'border-iaf-navy-light/50': 'border-slate-200',
  'border-iaf-navy-light': 'border-slate-200',
  'text-iaf-sky/20': 'text-slate-400',
  'text-iaf-sky/30': 'text-slate-400',
  'text-iaf-sky/40': 'text-slate-500',
  'text-iaf-sky/50': 'text-slate-500',
  'text-iaf-sky/60': 'text-slate-600',
  'text-iaf-sky/70': 'text-slate-600',
  'text-iaf-sky/80': 'text-slate-700',
  'text-iaf-sky/90': 'text-slate-800',
  'text-iaf-sky': 'text-slate-900',
  'text-iaf-gold': 'text-af-blue',
  'text-iaf-navy-dark': 'text-white',
  'bg-iaf-gold/10': 'bg-af-blue/10',
  'bg-iaf-gold/20': 'bg-af-blue/10',
  'bg-iaf-gold': 'bg-af-blue',
  'hover:bg-iaf-gold-light': 'hover:bg-af-midnight',
  'text-iaf-success': 'text-af-green',
  'bg-iaf-success/20': 'bg-af-green/10',
  'bg-iaf-success': 'bg-af-green',
  'text-iaf-warning': 'text-af-orange',
  'bg-iaf-warning/20': 'bg-af-orange/10',
  'bg-iaf-warning': 'bg-af-orange',
  'text-iaf-alert': 'text-red-500',
  'bg-iaf-alert/20': 'bg-red-500/10',
  'bg-iaf-alert': 'bg-red-500',
  'border-iaf-gold/50': 'border-af-blue/50',
  'border-iaf-gold': 'border-af-blue',
  'iaf-navy-dark': 'slate-50',
  'bg-black/70': 'bg-slate-900/50'
};

files.forEach(f => {
  let p = `c:/zFileD/Works/Glimmora/airforce-training-main/${f}`;
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    for(let k in map) {
      c = c.split(k).join(map[k]);
    }
    
    // Fix Simulation Page cut off issue
    if (f.includes('simulation/page.tsx')) {
      c = c.replace('sticky top-20 overflow-hidden', 'sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col overflow-hidden');
      c = c.replace('<CardContent>', '<CardContent className="overflow-y-auto p-6">');
      // Some cards might have <CardContent className="p-4">, so we replace carefully for the briefing panel
      c = c.replace(/<CardContent>\s*{\s*selectedSimulation \? \(/, '<CardContent className="overflow-y-auto p-6">\n              {selectedSimulation ? (');
    }
    
    // Remove dark terminal styles from Knowledge Page
    if (f.includes('knowledge/page.tsx')) {
        c = c.replace('prose-invert', ''); // remove dark mode typography
        c = c.replace(/<strong key={i} className="text-white font-semibold">/g, '<strong key={i} className="text-slate-900 font-bold">');
    }

    fs.writeFileSync(p, c);
    console.log(`Updated ${f}`);
  }
});
