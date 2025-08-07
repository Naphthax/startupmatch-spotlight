// src/app/dashboard/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VideoUpload } from "./VideoUpload"; // Import der Client-Komponente
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

// Icons für die UI
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const MessageSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

// Typ für das Feedback, um Typsicherheit zu gewährleisten
type FeedbackWithInvestor = {
  id: number;
  feedback_type: "text" | "audio";
  content: string;
  created_at: string;
  investor: {
    first_name: string | null;
  } | null;
  audio_url?: string; // Optional, wird serverseitig hinzugefügt
};

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  // 1. Den Pitch des Gründers abrufen
  const { data: pitch, error: pitchError } = await supabase
    .from("pitches")
    .select("id, video_url")
    .eq("user_id", session.user.id)
    .single();

  let viewCount = 0;
  let feedback: FeedbackWithInvestor[] = [];
  let publicVideoUrl: string | null = null;

  if (pitch) {
    // 2. Public URL für das Video generieren
    if (pitch.video_url) {
      const { data } = supabase.storage
        .from("pitches")
        .getPublicUrl(pitch.video_url);
      publicVideoUrl = data.publicUrl;
    }

    // 3. Views für den Pitch zählen
    const { count, error: viewError } = await supabase
      .from("pitch_views")
      .select("*", { count: "exact", head: true })
      .eq("pitch_id", pitch.id);
    if (count !== null) viewCount = count;

    // 4. Feedback für den Pitch abrufen und Investor-Namen mitladen
    const { data: feedbackData, error: feedbackError } = await supabase
      .from("feedback")
      .select(
        `
        id,
        feedback_type,
        content,
        created_at,
        investor: profiles ( first_name )
      `
      )
      .eq("pitch_id", pitch.id)
      .order("created_at", { ascending: false });

    if (feedbackData) {
      feedback = await Promise.all(
        feedbackData.map(async (item) => {
          let audioUrl: string | undefined = undefined;
          if (item.feedback_type === "audio" && item.content) {
            const { data } = supabase.storage
              .from("feedback-audio")
              .getPublicUrl(item.content);
            audioUrl = data.publicUrl;
          }
          return { ...item, audio_url: audioUrl };
        })
      );
    }
  }

  return (
    <main className="min-h-screen w-full bg-[#000000] text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white">Dein Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Linke Spalte: Upload und Views */}
          <div className="md:col-span-2 space-y-8">
            <VideoUpload pitchUrl={publicVideoUrl} />
            <Card className="w-full border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <EyeIcon className="text-[#00ff88]" />
                  <span>Pitch Views</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-bold">{viewCount}</p>
                <p className="text-sm text-gray-400">
                  Investoren haben sich deinen Pitch angesehen.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Rechte Spalte: Feedback */}
          <div className="md:col-span-1">
            <Card className="w-full border-gray-800 max-h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareIcon className="text-[#00ff88]" />
                  <span>Feedback</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto space-y-4">
                {feedback.length > 0 ? (
                  feedback.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-gray-900/50"
                    >
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                        <span>
                          von {item.investor?.first_name || "Einem Investor"}
                        </span>
                        <span>
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {item.feedback_type === "text" ? (
                        <p className="text-sm">{item.content}</p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <MicIcon className="h-5 w-5 text-[#00ff88] flex-shrink-0" />
                          <audio
                            controls
                            src={item.audio_url}
                            className="w-full h-10"
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center text-gray-500 py-8">
                    Noch kein Feedback erhalten.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
