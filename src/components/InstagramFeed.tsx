"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export default function InstagramFeed({ posts }: { posts: string[] }) {
  useEffect(() => {
    if (posts.length === 0) return;

    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, [posts]);

  if (posts.length === 0) return null;

  return (
    <section className="border-t border-neutral-800">
      <div className="mx-auto max-w-5xl px-5 py-14">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-orange-500">من انستجرام</p>
        <h2 className="mb-6 font-black tracking-tight text-2xl text-neutral-50">آخر شغلنا</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((url) => (
            <blockquote
              key={url}
              className="instagram-media"
              data-instgrm-permalink={url}
              data-instgrm-version="14"
              style={{ margin: 0, width: "100%" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
