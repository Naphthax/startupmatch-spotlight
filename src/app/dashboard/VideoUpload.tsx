// src/app/dashboard/VideoUpload.tsx
"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

// Ein einfaches Lade-Spinner-Icon
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

export function VideoUpload({ pitchUrl }: { pitchUrl: string | null }) {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setError(null);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      if (video.duration > 60) {
        setError("Dein Video darf maximal 60 Sekunden lang sein.");
        event.target.value = ""; // Reset file input
      } else {
        setFile(selectedFile);
      }
    };
    video.src = URL.createObjectURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Bitte wähle zuerst eine Videodatei aus.");
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Benutzer nicht gefunden.");

      const filePath = `${user.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("pitches")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          duplex: "half",
        });

      if (uploadError) throw uploadError;

      // Pitch in der Datenbank speichern oder aktualisieren
      const { error: dbError } = await supabase
        .from("pitches")
        .upsert(
          { user_id: user.id, video_url: filePath },
          { onConflict: "user_id" }
        );

      if (dbError) throw dbError;

      // Seite neu laden, um den neuen Pitch anzuzeigen
      router.refresh();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full border-gray-800">
      <CardHeader>
        <CardTitle>Dein Video-Pitch</CardTitle>
        <CardDescription>
          Lade ein Video von maximal 60 Sekunden hoch, um dich vorzustellen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pitchUrl && (
          <div>
            <Label>Aktueller Pitch</Label>
            <video src={pitchUrl} controls className="w-full rounded-md mt-2" />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="video-upload">
            {pitchUrl ? "Neues Video hochladen" : "Video hochladen"}
          </Label>
          <Input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        {uploading && (
          <Progress value={progress} className="w-full [&>*]:bg-[#00ff88]" />
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="w-full"
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Hochladen"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
