const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/layout/Navbar.tsx');
let code = fs.readFileSync(filePath, 'utf-8');

// Update PRO PLAN
code = code.replace(
  `feature: 'PRO PLAN'`,
  `feature: 'PRO: Unlimited Downloads / Priority Assets / Commercial Pack'`
);

code = code.replace(
  `PRO PLAN\n            </button>`,
  `PRO\n            </button>`
);

// Update 無料で登録
code = code.replace(
  `無料で登録\n            </button>`,
  `Download Free PNGs\n            </button>`
);

// Update font size and layout for buttons if needed
code = code.replace(
  `text-[11px] font-black text-white/90 uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-ai-purple/20 cursor-not-allowed opacity-95`,
  `text-[10px] sm:text-[11px] font-black text-white/90 uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-ai-purple/20 cursor-not-allowed opacity-95`
);

fs.writeFileSync(filePath, code);
console.log('Navbar updated.');
