const must = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SERVICE_ROLE_Key",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "ENGINE",
    "SWE_EXE",
    "SE_EPHE_PATH",
  ];
  
  const has = new Set(Object.keys(process.env));
  const miss = [];
  for (const line of must) {
    const options = line.split("|");
    const ok = options.some(k => has.has(k));
    if (!ok) miss.push(options[0]);
  }
  if (miss.length) {
    console.error("❌ Missing ENV:", miss);
    process.exit(1);
  } else {
    console.log("✅ ENV check OK");
  }
  