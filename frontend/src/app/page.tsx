"use client";

import { useState, useEffect, Suspense } from "react";
import NewsBroadcast from "@/components/NewsBroadcast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Terminal } from "lucide-react";

// Define the NewsArticle type
type NewsArticle = {
  title: string;
  content: string;
  url: string;
};

// Fallback UI for Suspense
function NewsBroadcastLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      <div className="md:col-span-2">
        <Card className="shadow-lg overflow-hidden h-full flex flex-col">
          <CardHeader className="bg-muted/50 p-4 border-b">
            <CardTitle className="text-xl text-primary flex items-center">
              <Skeleton className="h-6 w-6 mr-2 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-grow flex flex-col items-center justify-center bg-gradient-to-b from-card to-muted/30 relative">
            <Skeleton className="w-full aspect-video rounded-lg mb-4" />
            <div className="w-full max-w-md">
              <Skeleton className="w-full h-2 mb-3" />
              <div className="flex justify-center items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10">
              <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
              <p className="text-white text-lg font-medium">
                Loading News Broadcast...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1">
        <Card className="shadow-lg h-full flex flex-col">
          <CardHeader className="bg-muted/50 p-4 border-b">
            <CardTitle className="text-lg text-primary flex items-center">
              <Skeleton className="h-5 w-5 mr-2 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </CardTitle>
            <Skeleton className="h-4 w-48 mt-1" />
          </CardHeader>
          <CardContent className="p-4 flex-grow space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Home() {
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [script, setScript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to fetch news articles
  const fetchNews = async () => {
    try {
      const response = await fetch("http://localhost:5000/ai/get-articles");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const articles = await response.json();

      if (articles && articles.length > 0) {
        // Select a random article
        const randomArticle =
          articles[Math.floor(Math.random() * articles.length)];
        setArticle(randomArticle);

        // Generate script for the selected article
        await generateScript(randomArticle);
      } else {
        setError("No news articles could be fetched or found.");
        setIsLoading(false);
      }
    } catch (fetchError) {
      console.error("Error fetching news:", fetchError);
      setError(`Failed to fetch news. Please try again later.`);
      setIsLoading(false);
    }
  };

  // Function to generate news script
  const generateScript = async (articleData: NewsArticle) => {
    try {
      const response = await fetch(
        "http://localhost:5000/ai/generate-news-script",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            articleTitle: articleData.title,
            articleContent: articleData.content,
            articleUrl: articleData.url,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setScript(data.script);
    } catch (genError) {
      console.error("Error generating script:", genError);
      setError(
        "Failed to generate news script. Displaying article details only."
      );
      // Keep article data even if script generation fails
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch news on component mount
  useEffect(() => {
    fetchNews();
  }, []);

  // Function to refresh content
  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    setArticle(null);
    setScript(null);
    fetchNews();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary">
      <header className="bg-secondary py-4 px-6 shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 mr-2 text-accent"
            >
              <path d="M4.5 2.25a.75.75 0 0 0 0 1.5v16.5a.75.75 0 0 0 1.5 0v-1.321l3.474 1.61a.75.75 0 0 0 1.052-.41l8.679-19.426a.75.75 0 0 0-1.314-.593L5.83 15.369v-3.35a.75.75 0 0 0-.976-.724L4.5 11.625v-9.375Z" />
              <path d="M10.072 8.043a.75.75 0 0 0 .328-1.296l-6-3A.75.75 0 0 0 3.75 4.5v6.413l5.833 2.712a.75.75 0 0 0 .489-.015l.001-.001.001-.001.002-.001.005-.002a.752.752 0 0 0 .29-.112l.002-.001.001-.001a.75.75 0 0 0 .13-.074l.003-.002.007-.004a.749.749 0 0 0 .14-.098l.002-.002.002-.001h.001l.002-.002a.748.748 0 0 0 .121-.113l.002-.002.004-.005.005-.006a.75.75 0 0 0 .133-.191l-1.162-2.581-3.415 1.59a.75.75 0 0 0-.328 1.296l6 3a.75.75 0 0 0 .976-.724l1.06-2.358-6.224-2.889Z" />
            </svg>
            NewsCastAI
          </h1>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 inline animate-spin" />
                Loading...
              </>
            ) : (
              "New Article"
            )}
          </button>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8">
        {isLoading ? (
          <NewsBroadcastLoading />
        ) : error ? (
          <Alert variant="destructive" className="mb-8">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            {article && !script && (
              <div className="mt-4 border-t pt-4">
                <h3 className="font-semibold">Fetched Article Details:</h3>
                <p>
                  <strong>Title:</strong> {article.title}
                </p>
                <p>
                  <strong>URL:</strong>{" "}
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {article.url}
                  </a>
                </p>
              </div>
            )}
          </Alert>
        ) : script && article ? (
          <Suspense fallback={<NewsBroadcastLoading />}>
            <NewsBroadcast script={script} article={article} />
          </Suspense>
        ) : (
          <Alert className="mb-8">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Unexpected State</AlertTitle>
            <AlertDescription>
              Could not load news broadcast. Article or script missing.
            </AlertDescription>
          </Alert>
        )}
      </main>

      <footer className="bg-secondary py-3 px-6 text-center text-sm text-muted-foreground mt-auto">
        Powered by AI |{" "}
        {article ? (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            View Original Article
          </a>
        ) : (
          "Loading article..."
        )}
      </footer>
    </div>
  );
}
