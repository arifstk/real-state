"use client";

import { useSession, signOut } from "next-auth/react";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Camera, ShieldAlert, KeyRound, User, LogOut, LayoutDashboard, Eye, EyeOff } from "lucide-react";

type Role = "user" | "vendor" | "superadmin";

const avatarGradients: Record<string, string> = {
  A: "from-teal-500 to-teal-700",
  B: "from-emerald-500 to-teal-800",
  C: "from-cyan-500 to-teal-600",
  D: "from-teal-600 to-slate-700",
  E: "from-teal-400 to-emerald-600",
};

function getGradient(name: string) {
  const gradients = Object.values(avatarGradients);
  return gradients[name.charCodeAt(0) % gradients.length];
}

const roleConfig: Record<Role, { label: string; color: string }> = {
  user: { label: "Customer", color: "bg-teal-50 text-teal-700 border-teal-200" },
  vendor: { label: "Vendor", color: "bg-purple-50 text-purple-700 border-purple-200" },
  superadmin: { label: "Super Admin", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

function SectionCard({
  title,
  subtitle,
  children,
  icon,
  danger,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className={`auth-card overflow-hidden transition-all border ${danger ? "border-rose-200" : "border-teal-900/10"}`}>
      <div className={`px-6 py-4 border-b flex items-center gap-3 ${danger ? "border-rose-100 bg-rose-50/30" : "border-gray-100"}`}>
        {icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm ${danger ? "bg-rose-600" : "auth-icon-circle"}`}>
            {icon}
          </div>
        )}
        <div>
          <h2 className={`text-sm font-bold ${danger ? "text-rose-700" : "text-gray-800"}`}>{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function PasswordInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-input flex items-center px-4 py-1">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full py-2 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="text-gray-400 hover:text-teal-600 transition-colors cursor-pointer ml-2"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const rules = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "One lowercase letter", ok: /[a-z]/.test(password) },
    { label: "One number", ok: /[0-9]/.test(password) },
  ];
  const score = rules.filter((r) => r.ok).length;
  const bar = ["bg-rose-400", "bg-amber-400", "bg-yellow-400", "bg-teal-500"][score - 1] || "bg-gray-200";
  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < score ? bar : "bg-gray-200"}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {rules.map((r) => (
          <p key={r.label} className={`text-xs flex items-center gap-1 ${r.ok ? "text-teal-600" : "text-gray-400"}`}>
            <span>{r.ok ? "✓" : "○"}</span> {r.label}
          </p>
        ))}
      </div>
    </div>
  );
}

function DeleteAccountModal({
  onClose,
  onConfirm,
  deleting,
}: {
  onClose: () => void;
  onConfirm: () => void;
  deleting: boolean;
}) {
  const [confirmText, setConfirmText] = useState("");
  const canDelete = confirmText === "DELETE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 border border-rose-200 shadow-2xl">
        <h3 className="text-lg font-bold text-rose-700">Delete your account?</h3>
        <p className="text-sm text-gray-500 mt-2">
          This will permanently delete your account and all associated data. This action{" "}
          <span className="font-semibold text-rose-600">cannot be undone</span>.
        </p>
        <p className="text-xs font-bold text-gray-400 tracking-wider mt-4 mb-1.5">
          Type &quot;<span className="text-rose-600 uppercase">DELETE</span>&quot; to confirm
        </p>
        <div className="auth-input px-4 py-1">
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full py-2 bg-transparent text-sm text-gray-800 focus:outline-none"
            disabled={deleting}
          />
        </div>
        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="btn-oauth px-4 py-2 text-sm font-semibold text-gray-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canDelete || deleting}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-rose-600/20"
          >
            {deleting ? "Deleting…" : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profile, setProfile] = useState({ name: "", email: "", mobile: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name || session?.user?.name || "",
            email: data.email || session?.user?.email || "",
            mobile: data.mobile || data.phone || "",
          });
          return;
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }

      setProfile({
        name: session?.user?.name ?? "",
        email: session?.user?.email ?? "",
        mobile: (session?.user as any)?.mobile ?? (session?.user as any)?.phone ?? "",
      });
    }

    if (status === "authenticated" && session?.user) {
      fetchUserProfile();
      setAvatarSrc(session.user.image || null);
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="auth-page-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const user = session!.user as any;
  const role = (user.role as Role) || "user";
  const roleInfo = roleConfig[role] || roleConfig.user;
  const isGoogle = user.provider === "google" || (!user.password && !!user.image?.includes("google"));
  const initial = (user.name?.[0] ?? "U").toUpperCase();
  const gradient = getGradient(user.name ?? "U");

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    setAvatarSrc(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/user/upload-avatar", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setAvatarSrc(data.url);
        await update({ image: data.url });
        toast.success("Avatar updated!");
      } else {
        toast.error(data.error || "Upload failed.");
        setAvatarSrc(user.image || null);
      }
    } catch {
      toast.error("Upload failed.");
      setAvatarSrc(user.image || null);
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) { toast.error("Name is required."); return; }
    if (!profile.email.trim()) { toast.error("Email is required."); return; }

    setProfileSaving(true);
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        await update({ name: data.user.name, email: data.user.email });
        toast.success("Profile updated!");
      } else {
        toast.error(data.error || "Failed to save.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (pw.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pw),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password changed!");
        setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(data.error || "Failed to change password.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setPwSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/user/delete-account", { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Account deleted.");
        await signOut({ callbackUrl: "/" });
      } else {
        toast.error(data.error || "Failed to delete account.");
        setDeleting(false);
      }
    } catch {
      toast.error("Something went wrong.");
      setDeleting(false);
    }
  };

  const dashboardLink = role === "superadmin" ? "/admin" : role === "vendor" ? "/vendor-dashboard" : null;

  return (
    <main className="auth-page-bg py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your account information and settings
            </p>
          </div>
          {dashboardLink && (
            <Link
              href={dashboardLink}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 text-white font-bold text-xs cursor-pointer"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          )}
        </div>

        {/* Profile Picture */}
        <SectionCard title="Profile Picture" subtitle="Click avatar to upload a new photo (max 5MB)" icon={<Camera size={18} />}>
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="relative w-20 h-20 rounded-full overflow-hidden focus:outline-none focus:ring-4 focus:ring-teal-500/20 cursor-pointer shadow-md"
              >
                {avatarSrc ? (
                  <Image src={avatarSrc} alt="Avatar" fill className="object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className={`w-full h-full bg-linear-to-br ${gradient} flex items-center justify-center text-white text-2xl font-black`}>
                    {initial}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  {avatarUploading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div className="min-w-0">
              <p className="font-bold text-gray-800 truncate">{profile.name || user.name}</p>
              <p className="text-sm text-gray-500 truncate">{profile.email || user.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
                {isGoogle && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    🔵 Google Account
                  </span>
                )}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Account Info */}
        <SectionCard title="Account Information" subtitle="Read-only details about your account" icon={<User size={18} />}>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "User ID", value: user.id, mono: true },
              { label: "Sign-in", value: isGoogle ? "Google" : "Email & Password", mono: false },
              { label: "Role", value: roleInfo.label, mono: false },
              { label: "Email Verified", value: "Yes", mono: false },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  {item.label}
                </p>
                <p className={`text-sm text-gray-800 ${item.mono ? "font-mono text-xs break-all" : "font-semibold"}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Edit Profile */}
        <SectionCard title="Edit Profile" subtitle="Update your name, email, and mobile number" icon={<User size={18} />}>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Full Name *</label>
              <div className="auth-input px-4 py-1">
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full py-2 bg-transparent text-sm text-gray-800 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Email Address *</label>
              <div className="auth-input px-4 py-1">
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full py-2 bg-transparent text-sm text-gray-800 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Mobile Number</label>
              <div className="auth-input px-4 py-1">
                <input
                  type="text"
                  value={profile.mobile || ""}
                  onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                  className="w-full py-2 bg-transparent text-sm text-gray-800 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="btn-primary px-6 py-2.5 text-white text-sm font-bold cursor-pointer disabled:opacity-50"
              >
                {profileSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* Password */}
        {!isGoogle ? (
          <SectionCard title="Change Password" icon={<KeyRound size={18} />}>
            <form onSubmit={handlePasswordSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Current Password</label>
                <PasswordInput value={pw.currentPassword} onChange={(v) => setPw({ ...pw, currentPassword: v })} placeholder="Enter current password" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">New Password</label>
                <PasswordInput value={pw.newPassword} onChange={(v) => setPw({ ...pw, newPassword: v })} placeholder="At least 8 characters" />
                <PasswordStrength password={pw.newPassword} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Confirm New Password</label>
                <PasswordInput value={pw.confirmPassword} onChange={(v) => setPw({ ...pw, confirmPassword: v })} placeholder="Re-enter new password" />
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={pwSaving || !pw.currentPassword || pw.newPassword !== pw.confirmPassword}
                  className="btn-primary px-6 py-2.5 text-white text-sm font-bold cursor-pointer disabled:opacity-50"
                >
                  {pwSaving ? "Changing…" : "Change Password"}
                </button>
              </div>
            </form>
          </SectionCard>
        ) : (
          <SectionCard title="Change Password" icon={<KeyRound size={18} />}>
            <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100">
              <p className="text-sm text-gray-600">
                You signed in with Google. To change your password, visit your{" "}
                <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline font-semibold">
                  Google Account settings
                </a>.
              </p>
            </div>
          </SectionCard>
        )}

        {/* Sign Out */}
        <SectionCard title="Account Actions" icon={<LogOut size={18} />}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">Sign out of your account</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="btn-oauth px-4 py-2 text-rose-600 hover:bg-rose-50 border-rose-200 text-sm font-bold cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </SectionCard>

        {/* Danger Zone */}
        <SectionCard title="Danger Zone" subtitle="Irreversible actions" icon={<ShieldAlert size={18} />} danger>
          {role === "superadmin" ? (
            <p className="text-sm text-gray-500">
              Super Admin accounts can&apos;t be deleted here. Manage it directly in the database.
            </p>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Delete your account</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Permanently remove your account and all associated data.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          )}
        </SectionCard>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          deleting={deleting}
        />
      )}
    </main>
  );
}

