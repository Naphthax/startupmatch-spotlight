// src/app/feed/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";

// Swiper.js
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import type { Swiper as SwiperCore } from "swiper";
import { Mousewheel, Keyboard, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { useToast } from "@/components/ui/use-toast"

// --- ICONS ---
const MoneyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    className={cn("h-10 w-10 text-white drop-shadow-lg", props.className)}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-10.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm3 5.5h-1.5c-.83 0-1.5-.67-1.5-1.5v-3h-1v3c0 .83-.67 1.5-1.5 1.5H8v-1.5c.83 0 1.5-.67 1.5-1.5v-1.5c0-.83-.67-1.5-1.5-1.5H6.5v-1h3v.5c0 .83.67 1.5 1.5 1.5h1c.83 0 1.5-.67 1.5-1.5v-3h1.5v3c0 .83.67 1.5 1.5 1.5h1.5v1.5c-.83 0-1.5.67-1.5 1.5v1.5c0 .83.67 1.5 1.5 1.5H18v1h-3v-.5z" />
  </svg>
);
const Loader2 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);
const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);
const MicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);
const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

// --- DATENTYPEN (unverändert) ---
type Pitch = {
  id: string;
  video_url: string | null;
  public_video_url?: string;
  user_id: string;
  profile: {
    first_name: string | null;
    startup_details: {
      startup_name: string | null;
      website: string | null;
      funding_stage: string | null;
      description: string | null;
    }[];
    startup_goals: { goal: string }[];
  } | null;
  is_liked: boolean;
};

// --- NEUE FEEDBACK-LEISTE KOMPONENTE ---
function FeedbackBar({ pitchId }: { pitchId: string }) {
  const supabase = createClientComponentClient();
  // const { toast } = useToast();
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const handleSendText = async () => {
    if (!text.trim() || isSending) return;
    setIsSending(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("feedback").insert({
      pitch_id: pitchId,
      investor_id: user.id,
      feedback_type: "text",
      content: text.trim(),
    });

    if (error) {
      // toast({ title: "Fehler", description: "Feedback konnte nicht gesendet werden.", variant: "destructive" });
    } else {
      // toast({ title: "Gesendet!", description: "Dein Feedback wurde übermittelt." });
      setText("");
    }
    setIsSending(false);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        const audioChunks: Blob[] = [];

        recorder.ondataavailable = (event) => audioChunks.push(event.data);
        recorder.onstop = async () => {
          setIsSending(true);
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;

          const filePath = `${user.id}/${pitchId}-${Date.now()}.webm`;
          const { error: uploadError } = await supabase.storage
            .from("feedback-audio")
            .upload(filePath, audioBlob);

          if (uploadError) throw uploadError;

          const { error: dbError } = await supabase.from("feedback").insert({
            pitch_id: pitchId,
            investor_id: user.id,
            feedback_type: "audio",
            content: filePath,
          });

          if (dbError) throw dbError;

          // toast({ title: "Gesendet!", description: "Dein Audio-Feedback wurde übermittelt." });
          setIsSending(false);
        };
        recorder.start();
        setIsRecording(true);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // toast({ title: "Mikrofon-Fehler", description: "Zugriff auf das Mikrofon wurde verweigert.", variant: "destructive" });
      }
    }
  };

  return (
    <div className="absolute bottom-16 sm:bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl p-2 rounded-lg bg-black/50 backdrop-blur-sm flex items-center gap-2">
      <Input
        type="text"
        placeholder="Feedback geben..."
        className="bg-transparent border-gray-600 text-white placeholder:text-gray-400"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isRecording || isSending}
      />
      <Button
        size="icon"
        variant="ghost"
        onClick={handleSendText}
        disabled={!text.trim() || isRecording || isSending}
      >
        <SendIcon className="h-5 w-5" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={toggleRecording}
        disabled={isSending}
      >
        <MicIcon
          className={cn("h-5 w-5", {
            "text-red-500 animate-pulse": isRecording,
          })}
        />
      </Button>
    </div>
  );
}

// --- StartupProfile, VideoPlayer, PitchSlide, FeedPage (mit kleinen Anpassungen) ---
// (Der Rest des Codes ist größtenteils identisch, ich füge ihn hier zur Vollständigkeit ein)

function StartupProfile({
  pitch,
  onBack,
}: {
  pitch: Pitch;
  onBack: () => void;
}) {
  const details = pitch.profile?.startup_details[0];
  const goals = pitch.profile?.startup_goals || [];
  return (
    <div className="h-full w-full bg-black text-white p-4 overflow-y-auto">
      <Button
        onClick={onBack}
        variant="ghost"
        className="absolute top-4 left-4 text-white"
      >
        <ArrowLeftIcon className="h-6 w-6 mr-2" /> Zurück zum Video
      </Button>
      <div className="mt-16 space-y-6">
        <h2 className="text-4xl font-bold">
          {details?.startup_name || "Unbekanntes Startup"}
        </h2>
        <a
          href={details?.website || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#00ff88] hover:underline break-all"
        >
          {details?.website}
        </a>
        <div>
          <h3 className="font-bold text-gray-400">Beschreibung</h3>
          <p>{details?.description || "Keine Beschreibung verfügbar."}</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-400">Aktuelle Phase</h3>
          <p>{details?.funding_stage || "N/A"}</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-400">Unsere Ziele</h3>
          <ul className="list-disc list-inside space-y-1">
            {goals.map((g) => (
              <li key={g.goal}>{g.goal}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function VideoPlayer({
  pitch,
  onLikeToggle,
  onShowProfile,
}: {
  pitch: Pitch;
  onLikeToggle: (pitchId: string, isLiked: boolean) => void;
  onShowProfile: () => void;
}) {
  const [isLiked, setIsLiked] = useState(pitch.is_liked);
  const videoRef = useRef<HTMLVideoElement>(null);
  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    onLikeToggle(pitch.id, newLikedState);
  };
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const parentSlide = video.closest(".swiper-slide-active");
      if (parentSlide) {
        video.play().catch(console.error);
      } else {
        video.pause();
      }
    }
  }, []);
  return (
    <div className="relative h-full w-full bg-black" onDoubleClick={handleLike}>
      <video
        ref={videoRef}
        key={pitch.public_video_url}
        src={pitch.public_video_url}
        loop
        playsInline
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4 text-white">
        <h3 className="text-xl font-bold">
          {pitch.profile?.startup_details[0]?.startup_name ||
            "Unbekanntes Startup"}
        </h3>
        <p className="text-sm">
          von {pitch.profile?.first_name || "Einem Gründer"}
        </p>
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col items-center gap-4">
        <button onClick={handleLike}>
          <MoneyIcon
            className={cn("transition-colors", { "text-yellow-400": isLiked })}
          />
        </button>
        <button onClick={onShowProfile}>
          <InfoIcon className="h-10 w-10 text-white drop-shadow-lg" />
        </button>
      </div>
      <FeedbackBar pitchId={pitch.id} />{" "}
      {/* HIER WIRD DIE NEUE KOMPONENTE EINGEFÜGT */}
    </div>
  );
}

function PitchSlide({
  pitch,
  onLikeToggle,
}: {
  pitch: Pitch;
  onLikeToggle: (pitchId: string, isLiked: boolean) => void;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const horizontalSwiperRef = useRef<any>(null);
  const handleShowProfile = () =>
    horizontalSwiperRef.current?.swiper.slideNext();
  const handleBackToVideo = () =>
    horizontalSwiperRef.current?.swiper.slidePrev();
  return (
    <Swiper
      ref={horizontalSwiperRef}
      modules={[Navigation]}
      className="h-full w-full"
      nested={true}
    >
      <SwiperSlide>
        <VideoPlayer
          pitch={pitch}
          onLikeToggle={onLikeToggle}
          onShowProfile={handleShowProfile}
        />
      </SwiperSlide>
      <SwiperSlide>
        <StartupProfile pitch={pitch} onBack={handleBackToVideo} />
      </SwiperSlide>
    </Swiper>
  );
}

const PITCH_PAGE_SIZE = 5;
export default function FeedPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mainSwiperRef = useRef<any>(null);

  const fetchPitches = useCallback(
    async (currentPage: number) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return { data: [], hasMore: false };
      }
      const from = currentPage * PITCH_PAGE_SIZE;
      const to = from + PITCH_PAGE_SIZE - 1;
      const { data: pitchData, error } = await supabase
        .from("pitches")
        .select(
          `id, video_url, user_id, profile: profiles (first_name, startup_details ( startup_name, website, funding_stage, description ), startup_goals ( goal ))`
        )
        .range(from, to);
      if (error) {
        console.error("Fehler:", error);
        return { data: [], hasMore: false };
      }
      const pitchIds = pitchData.map((p) => p.id);
      const { data: likesData } = await supabase
        .from("pitch_likes")
        .select("pitch_id")
        .eq("investor_id", session.user.id)
        .in("pitch_id", pitchIds);
      const likedPitchIds = new Set(likesData?.map((l) => l.pitch_id));
      const pitchesWithDetails = pitchData.map((pitch) => {
        const { data: urlData } = supabase.storage
          .from("video-pitches")
          .getPublicUrl(pitch.video_url!);
        return {
          ...pitch,
          public_video_url: urlData.publicUrl,
          is_liked: likedPitchIds.has(pitch.id),
        };
      });
      return {
        data: pitchesWithDetails as unknown as Pitch[],
        hasMore: pitchesWithDetails.length === PITCH_PAGE_SIZE,
      };
    },
    [supabase, router]
  );

  useEffect(() => {
    setLoading(true);
    fetchPitches(0).then(({ data, hasMore: newHasMore }) => {
      setPitches(data);
      setHasMore(newHasMore);
      setPage(1);
      setLoading(false);
    });
  }, [fetchPitches]);
  const loadMorePitches = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const { data: newPitches, hasMore: newHasMore } = await fetchPitches(page);
    setPitches((prev) => [...prev, ...newPitches]);
    setHasMore(newHasMore);
    setPage((prev) => prev + 1);
    setLoadingMore(false);
  };
  const handleSlideChange = (swiper: SwiperCore) => {
    if (swiper.activeIndex >= pitches.length - 2 && hasMore) loadMorePitches();
    swiper.slides.forEach((slide, index) => {
      const video = slide.querySelector("video");
      if (video) {
        if (index === swiper.activeIndex) video.play().catch(console.error);
        else video.pause();
      }
    });
  };
  const handleLikeToggle = async (pitchId: string, isLiked: boolean) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    if (isLiked)
      await supabase
        .from("pitch_likes")
        .insert({ pitch_id: pitchId, investor_id: user.id });
    else
      await supabase
        .from("pitch_likes")
        .delete()
        .match({ pitch_id: pitchId, investor_id: user.id });
  };
  useHotkeys("arrowdown", () => mainSwiperRef.current?.swiper.slideNext());
  useHotkeys("arrowup", () => mainSwiperRef.current?.swiper.slidePrev());
  if (loading)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-[#00ff88]" />
      </div>
    );
  return (
    <div className="h-screen w-full bg-black">
      <Swiper
        ref={mainSwiperRef}
        direction={"vertical"}
        slidesPerView={1}
        spaceBetween={0}
        mousewheel={true}
        keyboard={true}
        modules={[Mousewheel, Keyboard]}
        className="h-full w-full"
        onSlideChange={handleSlideChange}
      >
        {pitches.map((pitch) => (
          <SwiperSlide key={pitch.id}>
            <PitchSlide pitch={pitch} onLikeToggle={handleLikeToggle} />
          </SwiperSlide>
        ))}
        {hasMore && (
          <SwiperSlide>
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
}
