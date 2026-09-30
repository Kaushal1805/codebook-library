import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env.local manually
let envContent = "";
try {
  envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf-8");
} catch (e) {
  console.warn("Could not read .env.local:", e.message);
}

const env = {};
envContent.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const [key, ...vals] = trimmed.split("=");
    if (key && vals.length > 0) {
      env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "");
    }
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_EMAIL = env.ADMIN_EMAIL || "admin@codebook.com";
const ADMIN_PASSWORD = env.ADMIN_PASSWORD || "Admin@CodeBook2026!";

async function setupAdmin() {
  console.log(`Setting up Admin user: ${ADMIN_EMAIL}...`);

  // 1. Check if user already exists
  const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError.message);
  }

  let adminUser = userList?.users?.find((u) => u.email === ADMIN_EMAIL);

  if (adminUser) {
    console.log(`Admin user already exists with ID: ${adminUser.id}. Updating password and role...`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(adminUser.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Super Admin" },
    });
    if (updateError) {
      console.error("Error updating user:", updateError.message);
    }
  } else {
    console.log("Creating new Admin user...");
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Super Admin" },
    });

    if (createError) {
      console.error("Error creating admin user:", createError.message);
      return;
    }
    adminUser = newUser.user;
    console.log(`Admin user created with ID: ${adminUser.id}`);
  }

  // 2. Ensure profile exists and has role = 'admin'
  if (adminUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", adminUser.id)
      .single();

    if (!profile) {
      const { error: insertError } = await supabase.from("profiles").insert({
        id: adminUser.id,
        email: ADMIN_EMAIL,
        full_name: "Super Admin",
        role: "admin",
      });
      if (insertError) {
        console.error("Error inserting profile:", insertError.message);
      } else {
        console.log("Admin profile created with role='admin'.");
      }
    } else {
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ role: "admin", full_name: "Super Admin" })
        .eq("id", adminUser.id);

      if (updateProfileError) {
        console.error("Error updating profile role:", updateProfileError.message);
      } else {
        console.log("Admin profile updated with role='admin'.");
      }
    }
  }

  console.log("\n==========================================");
  console.log("ADMIN ACCOUNT READY:");
  console.log(`Email / ID: ${ADMIN_EMAIL}`);
  console.log(`Password  : ${ADMIN_PASSWORD}`);
  console.log("Role      : admin");
  console.log("==========================================\n");
}

setupAdmin().catch(console.error);
