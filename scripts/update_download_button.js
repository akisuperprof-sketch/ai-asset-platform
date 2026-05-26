const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/download/DownloadButton.tsx');
let code = fs.readFileSync(filePath, 'utf-8');

// Imports
code = code.replace(
  `import { trackEvent } from "@/lib/analytics";`,
  `import { trackEvent } from "@/lib/analytics";\nimport { DownloadAdGate } from "@/components/ads/DownloadAdGate";\nimport { getNextAdType, incrementDownloadCount, AdType } from "@/lib/ad-rotation";`
);

// State
code = code.replace(
  `  const [showModal, setShowModal] = useState(false);`,
  `  const [showModal, setShowModal] = useState(false);\n  const [showAdGate, setShowAdGate] = useState(false);\n  const [adType, setAdType] = useState<AdType>('none');`
);

// OnClick
code = code.replace(
  `onClick={() => setShowModal(true)}`,
  `onClick={() => {\n              const nextAd = getNextAdType();\n              if (nextAd === 'none') {\n                setShowModal(true);\n              } else {\n                setAdType(nextAd);\n                setShowAdGate(true);\n              }\n            }}`
);

// handleDownload increment
code = code.replace(
  `    try {`,
  `    incrementDownloadCount();\n    try {`
);

// handleAdProceed
code = code.replace(
  `  const handleUnlockInstant = () => {`,
  `  const handleAdProceed = () => {\n    setShowAdGate(false);\n    handleDownload();\n  };\n\n  const handleUnlockInstant = () => {`
);

// Add component below RewardDownloadModal
code = code.replace(
  `      />\n\n      {/* Linear-style Premium Notification Toast */}`,
  `      />\n\n      {/* Ad Gate Modal */}\n      <DownloadAdGate\n        isOpen={showAdGate}\n        onClose={() => setShowAdGate(false)}\n        onProceed={handleAdProceed}\n        adType={adType}\n      />\n\n      {/* Linear-style Premium Notification Toast */}`
);

fs.writeFileSync(filePath, code);
console.log('DownloadButton updated.');
