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
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import type { NewsArticle } from "@/services/news-scraper";
import { set } from "date-fns";

interface NewsBroadcastProps {
  script: string;
  article: NewsArticle;
}

const NewsBroadcast: React.FC<NewsBroadcastProps> = ({ script, article }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(true);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null); // Placeholder for TTS audio URL
  const [videoUrl, setVideoUrl] = useState<string | null>(null); // Placeholder for lipsync video URL
  const [isVideoLoading, setIsVideoLoading] = useState(true); // Placeholder for video loading state

  // Placeholder for Text-to-Speech functionality
  // useEffect(() => {
  //   console.log(script, article);
  //   setIsAudioLoading(true); // Start loading state
  //   console.log(
  //     "Simulating TTS generation for script:",
  //     script.substring(0, 50) + "..."
  //   );
  //   // Simulate a delay for TTS generation
  //   const timer = setTimeout(() => {
  //     // Use a placeholder silent audio or a sample audio if available
  //     // Using a short silent WAV as placeholder
  //     setAudioUrl(
  //       "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAVAAAAHgAAAAEAAgAAgABAAEAAABkYXRhAAAAAA=="
  //     );
  //     // Note: setIsAudioLoading(false) will be handled by the 'loadedmetadata' event listener
  //   }, 2000); // Simulating 2 seconds for TTS audio generation

  //   return () => clearTimeout(timer);
  // }, [script]);

  useEffect(() => {
    if (!script) return;

    setIsAudioLoading(true);

    const generateAudio = async () => {
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ script }),
        });

        const data = await res.json();
        if (res.ok) {
          setAudioUrl(`data:audio/mp3;base64,${data.audio}`);
        } else {
          console.error("TTS API Error:", data.error);
        }
      } catch (err) {
        console.error("Client error calling TTS:", err);
      }
    };

    generateAudio();
  }, [script]);

  useEffect(() => {
    async function fetchLipsync() {
      if (!audioUrl) return; // Don't fetch if no audio URL
      try {
        setIsVideoLoading(true);
        const response = await fetch("/api/lipsync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audioBase64: audioUrl?.split(",")[1], // Extract base64 part
            imageUrl:
              "https://static.vecteezy.com/system/resources/thumbnails/029/329/444/small_2x/a-of-a-tv-news-female-presenter-on-a-popular-channel-live-stream-broadcast-on-television-ai-generative-photo.jpg", // Placeholder for avatar image
          }),
        });

        const data = await response.json();
        setVideoUrl(data.videoUrl);
      } catch (error) {
        console.error("Error fetching lipsync:", error);
      } finally {
        setIsVideoLoading(false);
      }
    }
    fetchLipsync();
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (!audioRef.current || isAudioLoading) return; // Don't interact if loading or no audio element

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Audio play failed:", error);
        setIsPlaying(false); // Ensure state reflects failure
      });
    }
    // State update is handled by 'play'/'pause' event listeners
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
        // If paused, start playing again from the beginning
        audioRef.current
          .play()
          .catch((error) =>
            console.error("Audio play failed on restart:", error)
          );
      }
      // If already playing, it will continue from the beginning, state managed by events
    }
  };

  useEffect(() => {
    const audioElement = audioRef.current;

    const updateProgress = () => {
      // Use the state variable for duration
      if (
        audioElement &&
        audioDuration &&
        isFinite(audioDuration) &&
        audioDuration > 0
      ) {
        setProgress((audioElement.currentTime / audioDuration) * 100);
      } else {
        setProgress(0); // Reset progress if duration is not valid
      }
    };

    const handleAudioEnd = () => {
      console.log("Audio ended");
      setIsPlaying(false);
      setProgress(100); // Explicitly set to 100%
      // No need to clear interval here, 'pause' handler does it
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
      setIsAudioLoading(false); // Audio is ready to be played
      updateProgress(); // Update progress based on initial currentTime (usually 0)
    };

    const handleLoadError = (e: Event | string) => {
      console.error("Audio loading error:", e);
      setIsAudioLoading(false); // Stop loading indicator
      // Optionally: Display an error to the user
    };

    if (audioElement) {
      // Reset state for new audio source
      setIsPlaying(false);
      setProgress(0);
      setIsAudioLoading(true); // Set loading until metadata is loaded
      setAudioDuration(null); // Reset duration

      // Add event listeners
      audioElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioElement.addEventListener("play", handleAudioPlay);
      audioElement.addEventListener("pause", handleAudioPause);
      audioElement.addEventListener("ended", handleAudioEnd);
      audioElement.addEventListener("timeupdate", updateProgress);
      audioElement.addEventListener("error", handleLoadError);

      // Initial check in case metadata loaded before listener attached
      if (audioElement.readyState >= 1) {
        // HAVE_METADATA or higher
        handleLoadedMetadata();
      }

      // Clean up listeners when component unmounts or audioUrl changes
      return () => {
        // Check if audioElement still exists before removing listeners
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
  }, [audioUrl]); // Re-run effect when audioUrl changes

  // Effect for interval-based progress updates ONLY when playing
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
      // Update progress frequently while playing
      interval = setInterval(updateProgress, 250); // Update every 250ms
    } else if (interval) {
      clearInterval(interval); // Clear interval if not playing
    }

    // Cleanup interval on unmount or when isPlaying changes
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, audioDuration]); // Depend on isPlaying and audioDuration

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      {/* Avatar Section */}
      <div className="md:col-span-2">
        <Card className="shadow-lg overflow-hidden h-full flex flex-col">
          <CardHeader className="bg-muted/50 p-4 border-b">
            <CardTitle className="text-xl text-primary flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2 text-accent"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm1.593-6.491 4.09 1.856a.75.75 0 0 0 .812-.057l4.09-2.838a.75.75 0 0 0 .132-1.03l-4.09-5.588a.75.75 0 0 0-1.148 0L7.46 8.87a.75.75 0 0 0 .132 1.03Z"
                />
              </svg>
              Live Broadcast
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-grow flex flex-col items-center justify-center bg-gradient-to-b from-card to-muted/30 relative">
            {/* Avatar */}
            <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden shadow-inner">
              <Image
                src="https://picsum.photos/1280/720"
                alt="News Anchor Avatar"
                layout="fill"
                objectFit="cover"
                className={`transition-transform duration-500 ease-in-out ${
                  isPlaying ? "scale-105" : "scale-100"
                }`}
                data-ai-hint="professional news anchor television studio"
                priority // Load image faster
              />
              {/* Lip Sync Placeholder Animation */}
              {isPlaying && (
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-red-400 rounded-full animate-pulse opacity-75"></div>
              )}
              {/* Loading Indicator for Audio */}
              {isAudioLoading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                  <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                  <p className="text-white text-lg font-medium">
                    Generating audio...
                  </p>
                </div>
              )}
            </div>
            <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden shadow-inner">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  autoPlay
                  muted={isMuted}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <div>avatar</div>
              )}
              {/* Loading Indicator for Video */}
              {isVideoLoading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                  <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                  <p className="text-white text-lg font-medium">
                    Generating video...
                  </p>
                </div>
              )}
            </div>

            {/* Playback Controls */}
            <div className="w-full max-w-md">
              <Progress
                value={progress}
                className="w-full h-2 mb-3"
                aria-label="Audio progress"
              />
              <div className="flex justify-center items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRestart}
                  disabled={!audioUrl || isAudioLoading}
                >
                  <RefreshCw className="h-5 w-5" />
                  <span className="sr-only">Restart</span>
                </Button>
                <Button
                  variant="default"
                  size="lg"
                  onClick={handlePlayPause}
                  disabled={!audioUrl || isAudioLoading}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full w-16 h-16 flex items-center justify-center shadow-md"
                  aria-live="polite" // Announce play/pause state change
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 fill-current" />
                  ) : (
                    <Play className="h-6 w-6 fill-current ml-1" />
                  )}{" "}
                  {/* Adjusted Play icon position */}
                  <span className="sr-only">
                    {isPlaying ? "Pause" : "Play"}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMuteToggle}
                  disabled={!audioUrl || isAudioLoading}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                  <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
                </Button>
              </div>
            </div>
            {/* Hidden Audio Element */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                preload="metadata"
                className="hidden"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Script Section */}
      <div className="md:col-span-1">
        <Card className="shadow-lg h-full flex flex-col">
          <CardHeader className="bg-muted/50 p-4 border-b">
            <CardTitle className="text-lg text-primary flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2 text-accent"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              News Script
            </CardTitle>
            <CardDescription>
              Article:{" "}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                {article.title}
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            {/* Ensure ScrollArea has a defined height relative to its container */}
            <ScrollArea className="h-full">
              <div className="p-4">
                {" "}
                {/* Add padding inside ScrollArea */}
                <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                  {script || "Generating script..."}
                </p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewsBroadcast;
