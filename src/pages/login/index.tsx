import { motion, useReducedMotion, type Variants } from "framer-motion";
import { CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { LoginCard } from "./components/LoginCard";
import { OrganizerRegistrationCard } from "./components/OrganizerRegistrationCard";
import { RegistrationSelectionCard } from "./components/RegistrationSelectionCard";
import { MemberRegistrationCard } from "./components/MemberRegistrationCard";
import { useMemberInvite } from "./hooks/useMemberInvite";
import { MemberLookupCard } from "./components/MemberLookUpCard";
import Swal from "sweetalert2";

const points = [
  "Lightweight planning for internal workshops, symposiums, and team celebrations.",
  "Simple task assignment, expense & evidence tracking, and live coordination.",
  "Built for non-project managers.",
  "Role-based access for Admins, Managers, Staff, and Attendees.",
];

const listVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.35,
    },
  },
};

const itemVariants: Variants = {
  hidden: { x: -14, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 60,
      damping: 18,
    },
  },
};

type View =
  | "login"
  | "signup-organizer"
  | "signup-member"
  | "forgot-password"
  | "registration-selection";

export default function LoginPage() {
  const [view, setView] = useState<View>("login");
  const bg = `${import.meta.env.BASE_URL}chrono_flow_login_bg.png`;
  const reduceMotion = useReducedMotion();

  const {
    prefill,
    loading: prefillLoading,
    lookup,
    fromInviteLink,
    userId,
    err: prefillErr,
    clearInvite,
  } = useMemberInvite();

  const onBack = () => {
    clearInvite();
    setView("login");
  };

  const onOrganizerRegistration = () => {
    setView("signup-organizer");
  };

  const onMemberRegistration = () => {
    setView("signup-member");
  };

  const onForgotPassword = () => {
    setView("forgot-password");
  };

  const onRegistrationSelection = () => {
    setView("registration-selection");
  };

  useEffect(() => {
    if (fromInviteLink) {
      setView("signup-member");
    }
  }, [fromInviteLink]);

  useEffect(() => {
    if (!prefillErr) return;
    void Swal.fire({
      icon: "error",
      title: "Invitation lookup failed",
      text: prefillErr,
      confirmButtonText: "OK",
    });
  }, [prefillErr]);

  return (
    <div className="relative grid min-h-svh overflow-hidden bg-background lg:grid-cols-[60%_40%]">
      {/* Mobile-only background */}
      <div
        className="absolute inset-0 bg-cover bg-center lg:hidden"
        style={{ backgroundImage: `url(${bg})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-white/70 dark:bg-background/80 lg:hidden"
        aria-hidden
      />

      {/* LEFT*/}
      <div className="relative hidden overflow-hidden lg:block -mr-px isolate">
        <img
          src={bg}
          alt="People coordinating an event"
          className="absolute inset-0 h-full w-full object-cover [transform:translateZ(0)]"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent" />

        {/* Animated overlay */}
        <motion.aside
          initial={reduceMotion ? false : { x: -40, opacity: 0 }}
          animate={reduceMotion ? {} : { x: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 40,
            damping: 20,
            delay: 0.2,
          }}
          className="absolute bottom-10 left-10 max-w-lg rounded-xl border border-white/30 bg-white/70 p-5 text-sm leading-relaxed text-foreground shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-background/70"
          aria-label="Why ChronoFlow"
        >
          <h3 className="mb-2 text-base font-semibold">Why ChronoFlow?</h3>

          {/* Staggered list */}
          <motion.ul
            variants={reduceMotion ? undefined : listVariants}
            initial={reduceMotion ? undefined : "hidden"}
            animate={reduceMotion ? undefined : "show"}
            className="space-y-2 pl-0"
          >
            {points.map((text) => (
              <motion.li
                key={text}
                variants={reduceMotion ? undefined : itemVariants}
                className="flex items-start gap-2"
              >
                <CheckCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                <span>{text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.aside>
      </div>

      {/* RIGHT (form) */}
      <div className="relative z-10 flex items-center justify-center p-6 md:p-10">
        <div
          className={`w-full ${
            view === "signup-organizer" ? "max-w-3xl" : "max-w-md"
          }`}
        >
          {view === "login" && (
            <LoginCard
              onRegistrationSelection={onRegistrationSelection}
              onForgotPassword={onForgotPassword}
            />
          )}

          {view === "registration-selection" && (
            <RegistrationSelectionCard
              onBack={onBack}
              onOrganizerRegistration={onOrganizerRegistration}
              onMemberRegistration={onMemberRegistration}
            />
          )}

          {view === "signup-organizer" && (
            <OrganizerRegistrationCard onBack={onBack} />
          )}

          {view === "signup-member" && (
            <>
              {prefillLoading && (
                <div className="w-full max-w-md rounded-2xl border border-black/5 bg-background/85 p-6 text-center shadow-xl">
                  <p>Loading invitation…</p>
                </div>
              )}

              {!prefillLoading && prefill && (
                <MemberRegistrationCard
                  onBack={onBack}
                  prefill={{ ...prefill, user_id: userId || "" }}
                  fromInviteLink={fromInviteLink}
                />
              )}

              {!prefillLoading && !prefill && (
                <MemberLookupCard onBack={onBack} onSearch={lookup} />
              )}
            </>
          )}

          {view === "forgot-password" && (
            <div className="w-full max-w-md rounded-2xl border border-black/5 bg-background/85 p-6 text-center shadow-xl backdrop-blur-md">
              <p>Forget password card</p>
              <button
                type="button"
                onClick={onBack}
                className="mt-4 text-sm underline underline-offset-4"
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
