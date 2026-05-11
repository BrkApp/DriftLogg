"use server";

import fs from "fs";
import path from "path";

interface WaitlistEntry {
  email: string;
  createdAt: string;
}

export async function joinWaitlist(
  email: string
): Promise<{ success: boolean; message: string }> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Invalid email address." };
  }

  const dataDir = path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, "waitlist.json");

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let entries: WaitlistEntry[] = [];
    if (fs.existsSync(filePath)) {
      entries = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    if (entries.some((e) => e.email === email)) {
      return { success: true, message: "You're already on the list!" };
    }

    entries.push({ email, createdAt: new Date().toISOString() });
    fs.writeFileSync(filePath, JSON.stringify(entries, null, 2), "utf-8");

    return { success: true, message: "You're on the list!" };
  } catch (err) {
    console.error("[waitlist] error:", err);
    return { success: false, message: "Server error. Please try again." };
  }
}
