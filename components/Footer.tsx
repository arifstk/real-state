// // components/Footer.tsx

// import Link from "next/link";
// import {
//   Mail,
//   Phone,
//   MapPin,
//   Heart,
//   ArrowUpRight,
//   ArrowRight,
//   Home,
// } from "lucide-react";
// import { FaGithub } from "react-icons/fa";
// import { FaInstagram, FaLinkedin } from "react-icons/fa6";
// import connectDB from "@/lib/mongodb";
// import SystemSettings from "@/models/SystemSettings";
// import { EXPLORE_LINKS } from "@/lib/constants";

// // Company / website name (hard coded)
// const COMPANY_NAME = "Real State";

// const XIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
//   <svg className={className} fill="currentColor" viewBox="0 0 24 24">
//     <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
//   </svg>
// );

// export default async function Footer() {
//   const currentYear = new Date().getFullYear();

//   let settings;
//   try {
//     await connectDB();
//     settings = await SystemSettings.findOne().lean();
//   } catch (error) {
//     console.error("Failed to load system settings:", error);
//   }

//   const twitterUrl = settings?.twitterUrl || "https://x.com";
//   const githubUrl = settings?.githubUrl || "https://github.com";
//   const linkedinUrl = settings?.linkedinUrl || "https://linkedin.com";
//   const instagramUrl = settings?.instagramUrl || "https://instagram.com";
//   const address = settings?.address || "123 Luxury Way, Suite 500, San Francisco, CA";
//   const phone = settings?.phone || "+1 (800) 123-4567";
//   const email = settings?.email || "support@luxurystays.com";

//   const socials = [
//     { href: twitterUrl, label: "X (Twitter)", icon: <XIcon className="w-4 h-4" /> },
//     { href: githubUrl, label: "GitHub", icon: <FaGithub size={17} /> },
//     { href: linkedinUrl, label: "LinkedIn", icon: <FaLinkedin size={17} /> },
//     { href: instagramUrl, label: "Instagram", icon: <FaInstagram size={17} /> },
//   ].filter((s) => s.href);

//   const linkCls = "text-slate-400 hover:text-white transition-colors";

//   return (
//     <footer className="relative w-full bg-slate-950 text-slate-400 mt-24 md:mt-28 border-t border-slate-800/60">
//       <div className="max-w-7xl mx-auto px-6">
//         {/* Call-to-action card overlapping the top edge of the footer */}
//         <div className="-mt-12 mb-14 rounded-3xl bg-linear-to-r from-teal-600 to-teal-800 px-6 py-8 sm:px-10 sm:py-9 shadow-xl shadow-teal-900/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
//           <div className="space-y-1.5">
//             <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
//               Selling a flat? List it with us.
//             </h3>
//             <p className="text-sm text-teal-50/80 max-w-xl">
//               Reach serious buyers, manage booking requests and mark your flat as sold from one dashboard.
//             </p>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-3 shrink-0">
//             <Link
//               href="/contact"
//               className="inline-flex items-center justify-center gap-2 bg-white text-teal-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-teal-50 transition"
//             >
//               Become a seller <ArrowRight size={16} />
//             </Link>
//             <Link
//               href="/flats"
//               className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-white/10 transition"
//             >
//               Browse flats
//             </Link>
//           </div>
//         </div>

//         {/* Main grid */}
//         <div className="grid grid-cols-2 lg:grid-cols-12 gap-10 pb-12">
//           {/* Brand & social links */}
//           <div className="col-span-2 lg:col-span-4 space-y-5">
//             <Link href="/" className="inline-flex items-center gap-2.5 text-white font-bold text-xl tracking-tight">
//               <span className="h-9 w-9 rounded-xl bg-teal-600 flex items-center justify-center">
//                 <Home size={18} className="text-white" />
//               </span>
//               <span>{COMPANY_NAME}</span>
//             </Link>

//             <p className="text-sm leading-relaxed max-w-sm text-slate-400">
//               Find verified flats and apartments for sale, talk directly to trusted sellers and book a
//               site visit, all in one place.
//             </p>

//             <div className="flex items-center gap-2.5 pt-1">
//               {socials.map((s) => (
//                 <a
//                   key={s.label}
//                   href={s.href}
//                   target="_blank"
//                   rel="noreferrer"
//                   aria-label={s.label}
//                   className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-teal-600 hover:border-teal-600 hover:text-white transition-all duration-200"
//                 >
//                   {s.icon}
//                 </a>
//               ))}
//             </div>
//           </div>

//           {/* Explore */}
//           <div className="lg:col-span-2 space-y-4">
//             <p className="text-xs font-semibold uppercase tracking-wider text-slate-200">Explore</p>
//             <ul className="space-y-3 text-sm">
//               {EXPLORE_LINKS.map((link) => (
//                 <li key={link.href}>
//                   <Link href={link.href} className={`${linkCls} inline-flex items-center gap-1 group`}>
//                     <span>{link.label}</span>
//                     <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Support & legal */}
//           <div className="lg:col-span-3 space-y-4">
//             <p className="text-xs font-semibold uppercase tracking-wider text-slate-200">Support & Legal</p>
//             <ul className="space-y-3 text-sm">
//               <li>
//                 <Link href="/help-center" className={linkCls}>
//                   Help Center & FAQ
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/terms-of-service" className={linkCls}>
//                   Terms of Service
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/privacy-policy" className={linkCls}>
//                   Privacy Policy
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Contact information */}
//           <div className="col-span-2 lg:col-span-3 space-y-4">
//             <p className="text-xs font-semibold uppercase tracking-wider text-slate-200">Get In Touch</p>
//             <ul className="space-y-3.5 text-sm">
//               {address && (
//                 <li className="flex items-start gap-3">
//                   <span className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
//                     <MapPin size={16} className="text-teal-400" />
//                   </span>
//                   <span className="pt-1.5">{address}</span>
//                 </li>
//               )}
//               {phone && (
//                 <li className="flex items-center gap-3">
//                   <span className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
//                     <Phone size={16} className="text-teal-400" />
//                   </span>
//                   <a href={`tel:${phone.replace(/\s+/g, "")}`} className={linkCls}>
//                     {phone}
//                   </a>
//                 </li>
//               )}
//               {email && (
//                 <li className="flex items-center gap-3">
//                   <span className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
//                     <Mail size={16} className="text-teal-400" />
//                   </span>
//                   <a href={`mailto:${email}`} className={linkCls}>
//                     {email}
//                   </a>
//                 </li>
//               )}
//             </ul>
//           </div>
//         </div>

//         {/* Bottom bar */}
//         <div className="py-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
//           <p>
//             © {currentYear} {COMPANY_NAME}. All rights reserved.
//           </p>

//           <p className="flex items-center gap-1.5">
//             <span>Built with</span>
//             <Heart size={14} className="fill-teal-500 text-teal-500" />
//             <span>by</span>
//             <a
//               href="https://arif-portfolio-eosin.vercel.app/"
//               target="_blank"
//               rel="noreferrer"
//               className="text-slate-300 font-medium hover:text-white transition-colors underline underline-offset-4"
//             >
//               Shaikh Arif
//             </a>
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }



// components/Footer.tsx

import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Heart,
  ArrowUpRight,
  ArrowRight,
  Home,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { FaInstagram, FaLinkedin } from "react-icons/fa6";
import connectDB from "@/lib/mongodb";
import SystemSettings from "@/models/SystemSettings";
import { EXPLORE_LINKS } from "@/lib/constants";

// Company / website name (hard coded)
const COMPANY_NAME = "Real State";

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

  const socials = [
    { href: twitterUrl, label: "X (Twitter)", icon: <XIcon className="w-4 h-4" /> },
    { href: githubUrl, label: "GitHub", icon: <FaGithub size={17} /> },
    { href: linkedinUrl, label: "LinkedIn", icon: <FaLinkedin size={17} /> },
    { href: instagramUrl, label: "Instagram", icon: <FaInstagram size={17} /> },
  ].filter((s) => s.href);

  const linkCls = "text-slate-600 hover:text-teal-700 transition-colors";

  return (
    <footer className="relative w-full bg-white text-slate-600 mt-24 md:mt-28 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        {/* Call-to-action card overlapping the top edge of the footer */}
        <div className="-mt-12 mb-14 rounded-3xl bg-linear-to-r from-teal-600 to-teal-800 px-6 py-8 sm:px-10 sm:py-9 shadow-xl shadow-teal-900/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Selling a flat? List it with us.
            </h3>
            <p className="text-sm text-teal-50/80 max-w-xl">
              Reach serious buyers, manage booking requests and mark your flat as sold from one dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-teal-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-teal-50 transition"
            >
              Become a seller <ArrowRight size={16} />
            </Link>
            <Link
              href="/flats"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-white/10 transition"
            >
              Browse flats
            </Link>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-10 pb-12">
          {/* Brand & social links */}
          <div className="col-span-2 lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 text-slate-900 font-bold text-xl tracking-tight">
              <span className="h-9 w-9 rounded-xl bg-teal-600 flex items-center justify-center">
                <Home size={18} className="text-white" />
              </span>
              <span>{COMPANY_NAME}</span>
            </Link>

            <p className="text-sm leading-relaxed max-w-sm text-slate-600">
              Find verified flats and apartments for sale, talk directly to trusted sellers and book a
              site visit, all in one place.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-teal-600 hover:border-teal-600 hover:text-white transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-900">Explore</p>
            <ul className="space-y-3 text-sm">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={`${linkCls} inline-flex items-center gap-1 group`}>
                    <span>{link.label}</span>
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & legal */}
          <div className="lg:col-span-3 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-900">Support & Legal</p>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/help-center" className={linkCls}>
                  Help Center & FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className={linkCls}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className={linkCls}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact information */}
          <div className="col-span-2 lg:col-span-3 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-900">Get In Touch</p>
            <ul className="space-y-3.5 text-sm">
              {address && (
                <li className="flex items-start gap-3">
                  <span className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-teal-600" />
                  </span>
                  <span className="pt-1.5">{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                    <Phone size={16} className="text-teal-600" />
                  </span>
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className={linkCls}>
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-3">
                  <span className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-teal-600" />
                  </span>
                  <a href={`mailto:${email}`} className={linkCls}>
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            © {currentYear} {COMPANY_NAME}. All rights reserved.
          </p>

          <p className="flex items-center gap-1.5">
            <span>Developed</span>
            {/* <Heart size={14} className="fill-teal-500 text-teal-500" /> */}
            <span>by</span>
            <a
              href="https://arif-portfolio-eosin.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="text-slate-700 font-medium hover:text-teal-700 transition-colors underline underline-offset-4"
            >
              Shaikh Arif
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

