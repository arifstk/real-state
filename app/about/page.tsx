// app/about/page.tsx

import connectDB from "@/lib/mongodb";
import Page from "@/models/Page";
import sanitizeHtml from "sanitize-html";
import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { cache } from "react";

export const revalidate = 3600;

const getAboutPage = cache(async () => {
  try {
    await connectDB();
    const pageData = await Page.findOne({ slug: "about-us" }).lean();
    return pageData ? JSON.parse(JSON.stringify(pageData)) : null;
  } catch (error) {
    console.error("Database connection error in getAboutPage:", error);
    return null;
  }
});

// Metadata
export async function generateMetadata(): Promise<Metadata> {
  const pageData = await getAboutPage();

  const title = pageData?.title || "About Us";
  const description =
    pageData?.excerpt ||
    `Learn more about ${SITE_NAME} — your trusted platform for verified flats and apartments for sale, with direct contact to trusted sellers.`;

  return {
    title: title,
    description: description,
    alternates: {
      canonical: `${SITE_URL}/about`,
    },
    openGraph: {
      title: title,
      description: description,
      url: `${SITE_URL}/about`,
      type: "website",
      images: [
        {
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [`${SITE_URL}/og-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function AboutPage() {
  const pageData = await getAboutPage();

  const rawHTML = pageData?.content || "<p>About us information coming soon.</p>";
  const cleanHTML = sanitizeHtml(rawHTML, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "h1",
      "h2",
      "h3",
      "u",
      "s",
      "strike",
      "blockquote",
      "code",
      "img",
      "span",
    ]),
    allowedAttributes: {
      "*": ["class"],
      a: ["href", "name", "target"],
      img: ["src", "alt"],
    },
  });

  return (
    <main className="max-w-4xl mx-auto py-12 px-2 sm:px-6 lg:px-8 w-full overflow-hidden">
      <h1 className="text-3xl font-extrabold mb-6 text-slate-800">
        {pageData?.title || "About Us"}
      </h1>

      <div className="md:bg-white rounded-xl md:p-6 md:border md:border-slate-100 md:shadow-xs w-full overflow-hidden">
        <div
          className="rich-content text-slate-700 leading-relaxed break-words
            [&_*]:max-w-full
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-slate-900
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-slate-900
            [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-slate-900
            [&_p]:text-sm [&_p]:mb-4 [&_p]:leading-relaxed
            [&_ul]:text-sm [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ul]:space-y-2
            [&_ol]:text-sm [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_ol]:space-y-2
            [&_li]:text-sm [&_li]:pl-1 [&_li]:mb-1 [&_li]:leading-relaxed
            [&_strong]:font-bold [&_strong]:text-slate-900
            [&_a]:text-green-700 [&_a]:font-semibold [&_a]:underline hover:[&_a]:text-teal-900
            [&_.ql-align-right]:text-right 
            [&_.ql-align-center]:text-center 
            [&_.ql-align-justify]:text-justify"
          dangerouslySetInnerHTML={{ __html: cleanHTML }}
        />
      </div>
    </main>
  );
}

