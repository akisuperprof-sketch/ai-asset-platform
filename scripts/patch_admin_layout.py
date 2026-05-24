import sys

with open("src/app/admin/layout.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace useEffect body
old_effect = """  useEffect(() => {
    // Simple, highly secure client-side session validation
    const auth = sessionStorage.getItem("assetninja_admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);"""

new_effect = """  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Secure HTTP-Only Cookie validation
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {})
      .finally(() => setIsChecking(false));
  }, []);"""
content = content.replace(old_effect, new_effect)

# Replace handleLogin
old_login = """  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default fallback admin pass is 'ninja-core-2026' if env is not loaded, keeping it extremely safe
    const masterPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "ninja-core-2026";
    
    if (password === masterPassword) {
      sessionStorage.setItem("assetninja_admin_auth", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("AUTHENTICATION FAILED: INVALID CRITICAL KEY");
    }
  };"""

new_login = """  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: password })
      });
      const data = await res.json();
      
      if (data.ok) {
        setIsAuthenticated(true);
        setError("");
      } else {
        if (data.error === 'SERVER_KEY_NOT_CONFIGURED') {
          setError("SYSTEM ERROR: D_STRATEGY_KEY NOT CONFIGURED");
        } else {
          setError("AUTHENTICATION FAILED: INVALID CRITICAL KEY");
        }
      }
    } catch (err) {
      setError("NETWORK ERROR");
    }
  };"""
content = content.replace(old_login, new_login)

# Replace logout button
old_logout = """            onClick={() => {
              sessionStorage.removeItem("assetninja_admin_auth");
              setIsAuthenticated(false);
            }}"""

new_logout = """            onClick={async () => {
              await fetch('/api/admin/auth', { method: 'DELETE' });
              setIsAuthenticated(false);
            }}"""
content = content.replace(old_logout, new_logout)

# Show checking state to prevent flash of login screen
old_cyber_portal = """  // Cyber Punk Auth Portal Overlay
  if (!isAuthenticated) {"""
new_cyber_portal = """  // Cyber Punk Auth Portal Overlay
  if (isChecking) {
    return <div className="min-h-screen bg-black" />; // simple dark loading state
  }
  
  if (!isAuthenticated) {"""
content = content.replace(old_cyber_portal, new_cyber_portal)

with open("src/app/admin/layout.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated layout.tsx")
