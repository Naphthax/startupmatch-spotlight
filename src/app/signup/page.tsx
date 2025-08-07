"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

// --- HELPER ICONS & COMPONENTS ---
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
const SegmentedProgress = ({
  currentStep,
  totalSteps,
  isStepValid,
}: {
  currentStep: number;
  totalSteps: number;
  isStepValid: boolean;
}) => (
  <div className="flex w-full items-center gap-2 pt-2">
    {Array.from({ length: totalSteps }).map((_, index) => {
      const step = index + 1;
      const isCompleted = step < currentStep;
      const isCurrentAndValid = step === currentStep && isStepValid;
      return (
        <div
          key={index}
          className="h-1 flex-1 rounded-full bg-gray-800 overflow-hidden"
        >
          {" "}
          <div
            className={cn(
              "h-1 rounded-full bg-[#00ff88] transition-all duration-500 ease-in-out",
              {
                "w-full": isCompleted || isCurrentAndValid,
                "w-0": !isCompleted && !isCurrentAndValid,
              }
            )}
          />{" "}
        </div>
      );
    })}{" "}
  </div>
);

// --- TYPE DEFINITIONS & CONSTANTS ---
type UserRole = "startup" | "angel-investor" | "vc" | "other";
type InvestmentStage = "family-friends" | "pre-seed" | "seed" | "series-a";
type FundingStage =
  | "no-fundraising"
  | "family-friends"
  | "pre-seed"
  | "seed"
  | "series-a";
type StartupGoal =
  | "accelerate-fundraising"
  | "find-investors"
  | "find-angels"
  | "get-feedback";
type InvestorIndustry =
  | "ai-ml"
  | "b2b-saas"
  | "climate-tech"
  | "consumer-goods"
  | "cybersecurity";
const industryOptions: { value: InvestorIndustry; label: string }[] = [
  { value: "ai-ml", label: "AI & Machine Learning" },
  { value: "b2b-saas", label: "B2B SaaS & Software" },
  { value: "climate-tech", label: "ClimateTech & GreenTech" },
  { value: "consumer-goods", label: "Consumer Goods & D2C" },
  { value: "cybersecurity", label: "Cybersecurity" },
];
const fundingStageOptions: { id: FundingStage; label: string }[] = [
  { id: "no-fundraising", label: "Idee" },
  { id: "family-friends", label: "F&F" },
  { id: "pre-seed", label: "Pre-Seed" },
  { id: "seed", label: "Seed" },
  { id: "series-a", label: "Series A" },
];
const ticketSizeLabels = [
  "bis 25.000€",
  "bis 50.000€",
  "bis 100.000€",
  "bis 150.000€",
  "bis 250.000€",
  "mehr",
];
const TOTAL_STEPS = 4;

const FundingStageSlider = ({
  value,
  onChange,
}: {
  value: FundingStage;
  onChange: (value: FundingStage) => void;
}) => {
  const currentIndex = useMemo(
    () => fundingStageOptions.findIndex((opt) => opt.id === value),
    [value]
  );
  const totalSteps = fundingStageOptions.length - 1;
  return (
    <div className="relative pt-4 pb-8">
      <Slider
        value={[currentIndex]}
        max={totalSteps}
        step={1}
        onValueChange={(val) => onChange(fundingStageOptions[val[0]].id)}
      />
      <div className="relative mt-4">
        {fundingStageOptions.map((option, index) => {
          const positionPercentage = (index / totalSteps) * 100;
          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={cn(
                "absolute top-0 text-xs font-semibold transition-colors",
                {
                  "text-[#00ff88]": currentIndex === index,
                  "text-gray-500 hover:text-white": currentIndex !== index,
                }
              )}
              style={{
                left: `${positionPercentage}%`,
                transform: "translateX(-50%)",
              }}
            >
              {" "}
              {option.label}{" "}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    role: "" as UserRole | "",
    startupName: "",
    website: "",
    fundingStage: "no-fundraising" as FundingStage,
    goals: [] as StartupGoal[],
    investorIndustries: [] as InvestorIndustry[],
    investmentStages: [] as InvestmentStage[],
    ticketSize: [2],
    firstName: "",
    lastName: "",
    linkedIn: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const isCurrentStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return formData.role !== "";
      case 2:
        if (formData.role === "startup")
          return (
            formData.startupName.trim() !== "" &&
            formData.website.trim() !== "" &&
            formData.fundingStage !== "" &&
            formData.goals.length > 0
          );
        if (formData.role === "angel-investor" || formData.role === "vc")
          return (
            formData.investorIndustries.length > 0 &&
            formData.investmentStages.length > 0
          );
        return true;
      case 3:
        return (
          formData.firstName.trim() !== "" && formData.lastName.trim() !== ""
        );
      case 4:
        return (
          /\S+@\S+\.\S+/.test(formData.email) &&
          formData.phoneNumber.trim() !== "" &&
          formData.password.length >= 8 &&
          formData.password === formData.confirmPassword
        );
      default:
        return false;
    }
  }, [currentStep, formData]);

  const handleNextStep = () => {
    if (isCurrentStepValid && currentStep < TOTAL_STEPS)
      setCurrentStep(currentStep + 1);
  };
  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleFinalSubmit = async () => {
    if (!isCurrentStepValid) return;
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            role: formData.role,
            linkedIn: formData.linkedIn,
            phoneNumber: formData.phoneNumber,
          },
        },
      });

      if (authError) throw authError;
      if (!user) throw new Error("Benutzer konnte nicht erstellt werden.");

      if (formData.role === "startup") {
        const { error: startupDetailsError } = await supabase
          .from("startup_details")
          .insert({
            user_id: user.id,
            startup_name: formData.startupName,
            website: formData.website,
            funding_stage: formData.fundingStage,
            description: "Test",
          });
        if (startupDetailsError) throw startupDetailsError;
        const goalsToInsert = formData.goals.map((goal) => ({
          user_id: user.id,
          goal,
        }));
        const { error: startupGoalsError } = await supabase
          .from("startup_goals")
          .insert(goalsToInsert);
        if (startupGoalsError) throw startupGoalsError;
      } else if (formData.role === "angel-investor" || formData.role === "vc") {
        const { error: investorDetailsError } = await supabase
          .from("investor_details")
          .insert({
            user_id: user.id,
            ticket_size_label: ticketSizeLabels[formData.ticketSize[0]],
          });
        if (investorDetailsError) throw investorDetailsError;
        const industriesToInsert = formData.investorIndustries.map(
          (industry) => ({ user_id: user.id, industry })
        );
        const { error: industriesError } = await supabase
          .from("investor_industries")
          .insert(industriesToInsert);
        if (industriesError) throw industriesError;
        const stagesToInsert = formData.investmentStages.map((stage) => ({
          user_id: user.id,
          stage,
        }));
        const { error: stagesError } = await supabase
          .from("investor_stages")
          .insert(stagesToInsert);
        if (stagesError) throw stagesError;
      }

      if (formData.role === "startup") router.push("/dashboard");
      else router.push("/feed");
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#000000] p-4">
      <Card className="w-full max-w-lg border-gray-800">
        <CardHeader>
          <CardDescription>
            Schritt {currentStep} von {TOTAL_STEPS}
          </CardDescription>
          <SegmentedProgress
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            isStepValid={isCurrentStepValid}
          />
        </CardHeader>
        <CardContent className="min-h-[250px] overflow-y-auto">
          {currentStep === 1 && (
            <div className="space-y-4">
              {" "}
              <Label className="text-xl font-bold">Ich bin ein:</Label>{" "}
              <RadioGroup
                value={formData.role}
                onValueChange={(value: UserRole) =>
                  setFormData({ ...formData, role: value })
                }
                className="space-y-2 pt-2"
              >
                {" "}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="startup" id="r1" />
                  <Label htmlFor="r1">Startup</Label>
                </div>{" "}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="angel-investor" id="r2" />
                  <Label htmlFor="r2">Angel-Investor</Label>
                </div>{" "}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vc" id="r3" />
                  <Label htmlFor="r3">VC / Family Office</Label>
                </div>{" "}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="r4" />
                  <Label htmlFor="r4">Etwas anderes</Label>
                </div>{" "}
              </RadioGroup>{" "}
            </div>
          )}

          {currentStep === 2 && formData.role === "startup" && (
            <div className="space-y-8">
              {" "}
              <div className="space-y-2">
                <Label htmlFor="startupName" className="text-lg font-bold">
                  Wie heißt dein Startup?
                </Label>
                <Input
                  id="startupName"
                  placeholder="z.B. ConnectPitch"
                  value={formData.startupName}
                  onChange={(e) =>
                    setFormData({ ...formData, startupName: e.target.value })
                  }
                />
              </div>{" "}
              <div className="space-y-2">
                <Input
                  id="website"
                  placeholder="Webseite (https://...)"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                />
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <Label className="text-lg font-bold">Wo steht ihr?</Label>{" "}
                <FundingStageSlider
                  value={formData.fundingStage}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, fundingStage: value }))
                  }
                />{" "}
              </div>{" "}
              <div className="space-y-4">
                <Label className="text-lg font-bold">
                  Was ist euer Ziel mit StartupMatch?
                </Label>
                <div className="space-y-2 pt-2">
                  {(
                    [
                      "Das Fundraising deutlich beschleunigen",
                      "Neue Investoren finden",
                      "Bessere Angels finden",
                      "Feedback & Netzwerk aufbauen",
                    ] as const
                  ).map((goal) => {
                    const goalId = goal
                      .toLowerCase()
                      .replace(/ & /g, "-")
                      .replace(/ /g, "-") as StartupGoal;
                    return (
                      <div key={goalId} className="flex items-center space-x-2">
                        <Checkbox
                          id={goalId}
                          checked={formData.goals.includes(goalId)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? setFormData((prev) => ({
                                  ...prev,
                                  goals: [...prev.goals, goalId],
                                }))
                              : setFormData((prev) => ({
                                  ...prev,
                                  goals: prev.goals.filter((g) => g !== goalId),
                                }));
                          }}
                        />
                        <Label htmlFor={goalId}>{goal}</Label>
                      </div>
                    );
                  })}
                </div>
              </div>{" "}
            </div>
          )}

          {currentStep === 2 &&
            (formData.role === "angel-investor" || formData.role === "vc") && (
              <div className="space-y-6">
                {" "}
                <div className="space-y-2 rounded-md border border-gray-800 bg-gray-900/50 p-4">
                  <p className="font-bold text-white">Investment Fokus</p>
                  <p className="text-sm text-gray-400">
                    Unsere Startups werden kuratiert. Wir stellen dir nur
                    Startups vor, die deinen Kriterien entsprechen. Zum Launch
                    wird es nochmal detaillierter.
                  </p>
                </div>{" "}
                <div className="space-y-4">
                  <Label className="text-lg font-bold">
                    In welche Branchen investierst du?
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {formData.investorIndustries.length > 0
                          ? `${formData.investorIndustries.length} ausgewählt`
                          : "Branchen auswählen..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Branchen suchen..." />
                        <CommandList>
                          <CommandEmpty>Keine Branche gefunden.</CommandEmpty>
                          <CommandGroup>
                            {industryOptions.map((option) => (
                              <CommandItem
                                key={option.value}
                                onSelect={() => {
                                  const selected = formData.investorIndustries;
                                  const isSelected = selected.includes(
                                    option.value
                                  );
                                  setFormData((prev) => ({
                                    ...prev,
                                    investorIndustries: isSelected
                                      ? selected.filter(
                                          (s) => s !== option.value
                                        )
                                      : [...selected, option.value],
                                  }));
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.investorIndustries.includes(
                                      option.value
                                    )
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {option.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>{" "}
                <div className="space-y-4">
                  <Label className="text-lg font-bold">
                    An welchen Stages bist du interessiert?
                  </Label>
                  <div className="space-y-2 pt-2">
                    {(
                      [
                        "Family & Friends",
                        "Pre-Seed",
                        "Seed",
                        "Series A",
                      ] as const
                    ).map((stage) => {
                      const stageId = stage
                        .toLowerCase()
                        .replace(/ & /g, "-")
                        .replace(/ /g, "-") as InvestmentStage;
                      return (
                        <div
                          key={stageId}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={stageId}
                            checked={formData.investmentStages.includes(
                              stageId
                            )}
                            onCheckedChange={(checked) => {
                              return checked
                                ? setFormData((prev) => ({
                                    ...prev,
                                    investmentStages: [
                                      ...prev.investmentStages,
                                      stageId,
                                    ],
                                  }))
                                : setFormData((prev) => ({
                                    ...prev,
                                    investmentStages:
                                      prev.investmentStages.filter(
                                        (s) => s !== stageId
                                      ),
                                  }));
                            }}
                          />
                          <Label htmlFor={stageId}>{stage}</Label>
                        </div>
                      );
                    })}
                  </div>
                </div>{" "}
                <div className="space-y-4">
                  <Label className="text-lg font-bold">
                    Wie hoch sind deine Ticketgrößen?
                  </Label>
                  <div className="pt-2">
                    <Slider
                      defaultValue={[2]}
                      max={5}
                      step={1}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, ticketSize: value }))
                      }
                    />
                    <p className="text-center text-sm text-gray-400 mt-2">
                      {ticketSizeLabels[formData.ticketSize[0]]}
                    </p>
                  </div>
                </div>{" "}
              </div>
            )}

          {currentStep === 3 && (
            <div className="space-y-6">
              {" "}
              <div className="space-y-2 rounded-md border border-gray-800 bg-gray-900/50 p-4">
                {" "}
                <p className="font-bold text-white">Persönliche Angaben</p>{" "}
                <p className="text-sm text-gray-400">
                  Diese Informationen helfen anderen, dich besser
                  kennenzulernen. Dein Nachname wird nicht öffentlich angezeigt.
                </p>{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <Label htmlFor="firstName" className="text-lg font-bold">
                  Vorname
                </Label>{" "}
                <Input
                  id="firstName"
                  placeholder="Max"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <Label htmlFor="lastName" className="text-lg font-bold">
                  Nachname
                </Label>{" "}
                <Input
                  id="lastName"
                  placeholder="Mustermann"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <Label htmlFor="linkedIn" className="text-lg font-bold">
                  LinkedIn Profil (optional)
                </Label>{" "}
                <Input
                  id="linkedIn"
                  placeholder="https://www.linkedin.com/in/..."
                  value={formData.linkedIn}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedIn: e.target.value })
                  }
                />{" "}
              </div>{" "}
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-lg font-bold">
                  Deine Email-Adresse
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-lg font-bold">
                  Handynummer
                </Label>
                <p className="text-sm text-gray-400">
                  Zum Launch schicken wir dir deinen Einladungscode per SMS.
                </p>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+49 123 4567890"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-lg font-bold">
                  Passwort
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="min. 8 Zeichen"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-lg font-bold">
                  Passwort bestätigen
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="min. 8 Zeichen"
                />
                {formData.password !== formData.confirmPassword &&
                  formData.confirmPassword && (
                    <p className="text-sm text-red-500">
                      Die Passwörter stimmen nicht überein.
                    </p>
                  )}
              </div>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <div className="pt-4 text-center">
                <p className="text-xs text-gray-500">
                  Mit der Anmeldung akzeptierst du unseren Datenschutz. Deine
                  Daten werden nicht weitergegeben und sind für niemanden extern
                  sichtbar.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center justify-between gap-4">
            {currentStep > 1 ? (
              <Button
                onClick={handlePrevStep}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Zurück
              </Button>
            ) : (
              <div />
            )}
            {currentStep < TOTAL_STEPS ? (
              <Button onClick={handleNextStep} disabled={!isCurrentStepValid}>
                Weiter
              </Button>
            ) : (
              <Button
                onClick={handleFinalSubmit}
                disabled={!isCurrentStepValid}
              >
                {formData.role === "startup" ? "Zum Dashboard" : "Zum Feed"}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
