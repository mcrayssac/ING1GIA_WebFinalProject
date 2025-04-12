// pages/news/[id].tsx (or .jsx if you're using JS)

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/loading";
import Alert from "@/components/alert";

export default function NewsArticlePage() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/news/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load article");
        return res.json();
      })
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} onClose={() => setError("")} />;
  if (!article) return null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <figure className="aspect-[3/2] w-full mb-8">
          <img
            className="w-full h-full object-cover object-center rounded-lg"
            src={article.imageUrl || "/pictures/news_placeholder.jpg"}
            alt={article.title}
          />
        </figure>
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>📍 {article.location}</span>
          <span>📁 {article.category}</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
        <p className="text-sm text-gray-400 mb-6">
          {new Date(article.date).toLocaleDateString()}
        </p>
        <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-line">
          {article.content}
        </p>
      </div>
    </div>
  );
}
