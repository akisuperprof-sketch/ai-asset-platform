const fs = require('fs');
const filePath = 'src/app/api/admin/approve/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

// Insert confirm check
const replacement = `
    const body = await request.json();
    const { assetId, action, ids, confirm } = body;

    // 5. 自動approve禁止: confirm gate
    if (action === "bulk_approve" || action === "approve_single") {
      if (confirm !== true) {
        return NextResponse.json({ success: false, error: "Manual confirmation gate: 'confirm: true' is required." }, { status: 403 });
      }
    }
`;

code = code.replace(/    const body = await request\.json\(\);\n    const { assetId, action, ids } = body;/, replacement);

fs.writeFileSync(filePath, code);
console.log("Patched API successfully.");
