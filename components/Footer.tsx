
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Heart,
  ArrowUpRight,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { FaInstagram, FaXTwitter, FaLinkedin } from "react-icons/fa6";
import connectDB from "@/lib/mongodb";
import SystemSettings from "@/models/SystemSettings";

const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default async function Footer() {
  const currentYear = new Date().getFullYear();

  let settings;
  try {
    await connectDB();
    settings = await SystemSettings.findOne().lean();
  } catch (error) {
    console.error("Failed to load system settings:", error);
  }

  const twitterUrl = settings?.twitterUrl || "https://x.com";
  const githubUrl = settings?.githubUrl || "https://github.com";
  const linkedinUrl = settings?.linkedinUrl || "https://linkedin.com";
  const instagramUrl = settings?.instagramUrl || "https://instagram.com";
  const address = settings?.address || "123 Luxury Way, Suite 500, San Francisco, CA";
  const phone = settings?.phone || "+1 (800) 123-4567";
  const email = settings?.email || "support@luxurystays.com";

  return (
    <footer className="w-full bg-slate-950 text-slate-400 pt-16 pb-8 mt-5 md:mt-15 border-t border-slate-800/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/60">

          {/* Brand & Dynamic Social Links */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-xl tracking-tight">
              <span>LuxuryStays</span>
            </Link>

            <p className="text-sm leading-relaxed max-w-sm text-slate-400">
              Discover handpicked luxury hotels, boutique rooms, and serene resorts worldwide with seamless instant booking and verified guest reviews.
            </p>

            {/* Dynamic Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-teal-500/10 hover:text-teal-400 border border-slate-800 hover:border-teal-500/30 transition-all duration-200"
                  aria-label="X (Twitter)"
                >
                  <XIcon className="w-4 h-4" />
                </a>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-teal-500/10 hover:text-teal-400 border border-slate-800 hover:border-teal-500/30 transition-all duration-200"
                  aria-label="GitHub"
                >
                  <FaGithub size={18} />
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-teal-500/10 hover:text-teal-400 border border-slate-800 hover:border-teal-500/30 transition-all duration-200"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin size={18} />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-teal-500/10 hover:text-teal-400 border border-slate-800 hover:border-teal-500/30 transition-all duration-200"
                  aria-label="Instagram"
                >
                  <FaInstagram size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-200">Explore</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/rooms" className="hover:text-teal-400 transition-colors inline-flex items-center gap-1 group">
                  <span>Browse Rooms</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/hotels" className="hover:text-teal-400 transition-colors inline-flex items-center gap-1 group">
                  <span>Featured Hotels</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-200">Support & Legal</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/help-center" className="hover:text-teal-400 transition-colors">
                  Help Center & FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-teal-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-teal-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Dynamic Contact Information */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-200">Get In Touch</p>
            <ul className="space-y-3 text-sm">
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-teal-400 shrink-0 mt-0.5" />
                  <span>{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-teal-400 shrink-0" />
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-teal-400 transition-colors">
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-teal-400 shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-teal-400 transition-colors">
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} LuxuryStays Inc. All rights reserved.</p>

          <p className="flex items-center gap-1.5">
            <span>Built with</span>
            <Heart size={14} className="fill-teal-500 text-teal-500" />
            <span>by</span>
            <a
              href="https://arif-portfolio-eosin.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 font-medium hover:text-teal-400 transition-colors underline underline-offset-4"
            >
              Shaikh Arif
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

