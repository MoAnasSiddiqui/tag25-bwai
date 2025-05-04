"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RefreshCw,
  Volume2,
  VolumeX,
  Loader2,
  SkipForward,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import type { NewsArticle } from "@/services/news-scraper";

interface NewsBroadcastProps {
  script: string;
  article: NewsArticle;
  audioUrl: string; // Now receiving audio URL directly instead of generating it
  onComplete: () => void; // Function to call when audio completes
  articleIndex: number; // Current article index
  totalArticles: number; // Total number of articles
}

const NewsBroadcast: React.FC<NewsBroadcastProps> = ({
  script,
  article,
  audioUrl,
  onComplete,
  articleIndex,
  totalArticles,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(true);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [autoPlay, setAutoPlay] = useState(true); // Controls automatic playback of articles

  // Reset all states when article changes
  useEffect(() => {
    setProgress(0);
    setIsPlaying(false);
    setIsAudioLoading(true);
    setAudioDuration(null);
  }, [article.url]); // Reset when article URL changes

  // Auto-play when audio is loaded if autoPlay is enabled
  useEffect(() => {
    if (audioRef.current && !isAudioLoading && autoPlay) {
      audioRef.current.play().catch((err) => {
        console.error("Auto-play failed:", err);
        // Many browsers require user interaction before auto-play
        setIsPlaying(false);
      });
    }
  }, [isAudioLoading, autoPlay]);

  const handlePlayPause = () => {
    if (!audioRef.current || isAudioLoading) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Audio play failed:", error);
        setIsPlaying(false);
      });
    }
  };

  const handleMuteToggle = () => {
    if (audioRef.current) {
      const muted = !audioRef.current.muted;
      audioRef.current.muted = muted;
      setIsMuted(muted);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      if (!isPlaying) {
        audioRef.current
          .play()
          .catch((error) =>
            console.error("Audio play failed on restart:", error)
          );
      }
    }
  };

  const handleSkipToNext = () => {
    // Manually trigger the next article
    onComplete();
  };

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
  };

  useEffect(() => {
    const audioElement = audioRef.current;

    const updateProgress = () => {
      if (
        audioElement &&
        audioDuration &&
        isFinite(audioDuration) &&
        audioDuration > 0
      ) {
        setProgress((audioElement.currentTime / audioDuration) * 100);
      } else {
        setProgress(0);
      }
    };

    const handleAudioEnd = () => {
      console.log("Audio ended");
      setIsPlaying(false);
      setProgress(100);

      // Call onComplete to advance to the next article
      if (autoPlay) {
        setTimeout(() => {
          onComplete();
        }, 1000); // Small delay before moving to next article
      }
    };

    const handleAudioPlay = () => {
      console.log("Audio play event");
      setIsPlaying(true);
    };

    const handleAudioPause = () => {
      console.log("Audio pause event");
      setIsPlaying(false);
    };

    const handleLoadedMetadata = () => {
      console.log("Audio metadata loaded");
      setAudioDuration(audioElement?.duration ?? null);
      setIsAudioLoading(false);
      updateProgress();
    };

    const handleLoadError = (e: Event | string) => {
      console.error("Audio loading error:", e);
      setIsAudioLoading(false);
    };

    if (audioElement) {
      // Reset state for new audio source
      setIsPlaying(false);
      setProgress(0);
      setIsAudioLoading(true);
      setAudioDuration(null);

      // Add event listeners
      audioElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioElement.addEventListener("play", handleAudioPlay);
      audioElement.addEventListener("pause", handleAudioPause);
      audioElement.addEventListener("ended", handleAudioEnd);
      audioElement.addEventListener("timeupdate", updateProgress);
      audioElement.addEventListener("error", handleLoadError);

      // Initial check in case metadata loaded before listener attached
      if (audioElement.readyState >= 1) {
        handleLoadedMetadata();
      }

      // Clean up listeners
      return () => {
        if (audioElement) {
          audioElement.removeEventListener(
            "loadedmetadata",
            handleLoadedMetadata
          );
          audioElement.removeEventListener("play", handleAudioPlay);
          audioElement.removeEventListener("pause", handleAudioPause);
          audioElement.removeEventListener("ended", handleAudioEnd);
          audioElement.removeEventListener("timeupdate", updateProgress);
          audioElement.removeEventListener("error", handleLoadError);
        }
      };
    }
  }, [audioUrl, onComplete, autoPlay]);

  // Progress update interval when playing
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const audioElement = audioRef.current;

    const updateProgress = () => {
      if (
        audioElement &&
        audioDuration &&
        isFinite(audioDuration) &&
        audioDuration > 0
      ) {
        setProgress((audioElement.currentTime / audioDuration) * 100);
      }
    };

    if (isPlaying && audioElement) {
      interval = setInterval(updateProgress, 250);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, audioDuration]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      {/* Avatar Section */}
      <div className="md:col-span-2">
        <Card className="shadow-xl overflow-hidden h-full flex flex-col bg-gray-900 border-gray-800 rounded-xl">
          <CardHeader className="bg-gray-900 p-4 border-b border-gray-800">
            <CardTitle className="text-xl text-white flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 mr-2 text-blue-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm1.593-6.491 4.09 1.856a.75.75 0 0 0 .812-.057l4.09-2.838a.75.75 0 0 0 .132-1.03l-4.09-5.588a.75.75 0 0 0-1.148 0L7.46 8.87a.75.75 0 0 0 .132 1.03Z"
                  />
                </svg>
                <span className="font-bold text-blue-500">LIVE BROADCAST</span>
              </div>
              <div className="text-sm font-medium text-gray-300 bg-gray-800 px-3 py-1 rounded-full">
                Article {articleIndex + 1} of {totalArticles}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-grow flex flex-col items-center justify-center bg-gray-900 relative">
            {/* Avatar Container with Glow Effect */}
            <div className="w-full aspect-video rounded-xl mb-6 flex items-center justify-center relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-blue-600/20 rounded-xl filter blur-2xl opacity-40 animate-pulse-slow"></div>

              {/* Image container with inner shadow */}
              <div className="w-full aspect-video bg-gray-900 rounded-xl flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.6)] z-10">
                <Image
                  src="https://static.vecteezy.com/system/resources/thumbnails/029/329/444/small_2x/a-of-a-tv-news-female-presenter-on-a-popular-channel-live-stream-broadcast-on-television-ai-generative-photo.jpg"
                  alt="News Anchor Avatar"
                  layout="fill"
                  objectFit="cover"
                  className={`transition-transform duration-500 ease-in-out ${
                    isPlaying ? "scale-105" : "scale-100"
                  }`}
                  priority
                />

                {/* Simple overlay for better contrast */}
                <div className="absolute inset-0 bg-black/30"></div>

                {/* Live indicator */}
                <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg z-20">
                  <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                  LIVE
                </div>

                {/* Lip Sync Animation - simplified */}
                {isPlaying && (
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-20 h-2 flex space-x-1">
                    <div className="w-2 h-full bg-blue-500 rounded-full animate-sound"></div>
                    <div className="w-3 h-full bg-blue-500 rounded-full animate-sound-delay-1"></div>
                    <div className="w-4 h-full bg-blue-500 rounded-full animate-sound-delay-2"></div>
                    <div className="w-3 h-full bg-blue-500 rounded-full animate-sound-delay-3"></div>
                    <div className="w-2 h-full bg-blue-500 rounded-full animate-sound-delay-4"></div>
                  </div>
                )}

                {/* Loading Indicator for Audio */}
                {isAudioLoading && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-2" />
                    <p className="text-white text-lg font-medium bg-black/50 px-4 py-2 rounded-full">
                      Loading audio...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="w-full max-w-md">
              <Progress
                value={progress}
                className="w-full h-2 mb-3 bg-gray-800 rounded-full"
              />
              <div
                className="h-2 bg-blue-500 rounded-full -mt-5 mb-3"
                style={{ width: `${progress}%` }}
              ></div>

              <div className="flex justify-center items-center space-x-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRestart}
                  disabled={isAudioLoading}
                  className="text-gray-300 hover:text-white hover:bg-gray-800 rounded-full"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span className="sr-only">Restart</span>
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  onClick={handlePlayPause}
                  disabled={isAudioLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
                  aria-live="polite"
                >
                  {isPlaying ? (
                    <Pause className="h-7 w-7 fill-current" />
                  ) : (
                    <Play className="h-7 w-7 fill-current ml-1" />
                  )}
                  <span className="sr-only">
                    {isPlaying ? "Pause" : "Play"}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMuteToggle}
                  disabled={isAudioLoading}
                  className="text-gray-300 hover:text-white hover:bg-gray-800 rounded-full"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                  <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkipToNext}
                  title="Skip to next article"
                  className="text-gray-300 hover:text-white hover:bg-gray-800 rounded-full"
                >
                  <SkipForward className="h-5 w-5" />
                  <span className="sr-only">Next Article</span>
                </Button>
              </div>

              {/* Auto-play toggle */}
              <div className="mt-4 flex justify-center">
                <Button
                  variant={autoPlay ? "default" : "outline"}
                  size="sm"
                  onClick={toggleAutoPlay}
                  className={`text-xs font-medium rounded-full ${
                    autoPlay
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "text-gray-300 border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  {autoPlay ? "Auto-Play ON" : "Auto-Play OFF"}
                </Button>
              </div>
            </div>

            {/* Audio Element */}
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
              className="hidden"
            />
          </CardContent>
        </Card>
      </div>

      {/* Script Section */}
      <div className="md:col-span-1 source-serif-4">
        <Card className="shadow-xl h-full flex flex-col bg-gray-900 border-gray-800 rounded-xl">
          <CardHeader className="bg-gray-900 p-4 border-b border-gray-800">
            <CardTitle className="text-lg text-white flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              <span className="font-bold">{article.title}</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Article:{" "}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-400 hover:underline transition-colors"
              >
                {article.title}
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            <ScrollArea className="h-full max-h-[60vh]">
              <div className="p-5">
                <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {script}
                </p>
              </div>
            </ScrollArea>
          </CardContent>
          {/* <CardFooter className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between w-full text-xs text-gray-400">
          <span>Source: {article.source || "News API"}</span>
          <span>Updated: {new Date(article.publishedAt).toLocaleDateString()}</span>
        </div>
      </CardFooter> */}
        </Card>
      </div>
    </div>
  );
};

export default NewsBroadcast;
