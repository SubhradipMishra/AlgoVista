const fs = require('fs');

const path = 'client/src/components/Community.jsx';
let code = fs.readFileSync(path, 'utf8');

// Replace flat borders with soft white borders
code = code.replace(/border-\[rgba\(250,204,21,0\.\d+\)\]/g, 'border-white/10');
code = code.replace(/!border-\[rgba\(250,204,21,0\.\d+\)\]/g, '!border-white/10');

// Background replacements for glassmorphism
code = code.replace(/bg-\[linear-gradient\(145deg,rgba\(250,204,21,0\.08\),rgba\(6,6,6,0\.98\)\)\]/g, 'bg-white/5 backdrop-blur-xl');
code = code.replace(/bg-\[linear-gradient\(145deg,rgba\(250,204,21,0\.06\),rgba\(8,8,8,0\.96\)\)\]/g, 'bg-white/5 backdrop-blur-xl');
code = code.replace(/bg-\[linear-gradient\(180deg,rgba\(12,12,12,0\.96\),rgba\(4,4,4,0\.98\)\)\]/g, 'bg-white/5 backdrop-blur-xl');
code = code.replace(/bg-\[linear-gradient\(180deg,rgba\(12,12,12,0\.96\),rgba\(5,5,5,0\.98\)\)\]/g, 'bg-white/5 backdrop-blur-xl');
code = code.replace(/bg-black\/50/g, 'bg-white/5 backdrop-blur-lg');
code = code.replace(/bg-black\/55/g, 'bg-white/5 backdrop-blur-lg');
code = code.replace(/bg-black\/60/g, 'bg-white/5 backdrop-blur-lg');
code = code.replace(/bg-\[#101214\]/g, 'bg-white/5');
code = code.replace(/bg-\[#181b1f\]/g, 'bg-white/10');
code = code.replace(/bg-\[#0b0d10\]/g, 'bg-transparent');
code = code.replace(/bg-\[#0f1114\]/g, 'bg-transparent');
code = code.replace(/bg-\[#111\]/g, 'bg-white/10');
code = code.replace(/bg-black/g, 'bg-[#09090b]');
code = code.replace(/!bg-black/g, '!bg-[#09090b]');
code = code.replace(/bg-\[#050505\]/g, 'bg-[#09090b]');

// Typography softening
code = code.replace(/font-black uppercase tracking-\[0\.14em\]/g, 'font-semibold');
code = code.replace(/font-black uppercase tracking-\[0\.16em\]/g, 'font-semibold');
code = code.replace(/font-black uppercase tracking-\[0\.18em\]/g, 'font-bold');
code = code.replace(/font-black uppercase tracking-\[0\.2em\]/g, 'font-bold tracking-wide uppercase');
code = code.replace(/font-black uppercase tracking-\[0\.22em\]/g, 'font-bold tracking-wide uppercase');
code = code.replace(/font-black uppercase tracking-\[0\.28em\]/g, 'font-bold tracking-widest uppercase');

code = code.replace(/uppercase tracking-\[0\.16em\]/g, '');
code = code.replace(/uppercase tracking-\[0\.18em\]/g, '');
code = code.replace(/uppercase tracking-\[0\.14em\]/g, '');

code = code.replace(/!font-black !uppercase !tracking-\[0\.16em\]/g, '!font-semibold');
code = code.replace(/!font-black !uppercase !tracking-\[0\.18em\]/g, '!font-bold');
code = code.replace(/!font-black !uppercase !tracking-\[0\.14em\]/g, '!font-semibold');

// Replace monospace with standard sans serif for modern look
code = code.replace(/font-mono/g, 'font-sans');
code = code.replace(/font-black/g, 'font-bold');

fs.writeFileSync(path, code);
console.log('Update complete!');
