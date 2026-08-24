"use client";

import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  FlaskConical,
  LogIn,
  LogOut,
  MessageCircle,
  MessageSquare,
  Plus,
  Search,
  UserCircle,
  UserPlus,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useResearch,
  type ResearchJob,
} from "@/components/context/ResearchContext";

import {
  useConversation,
  type ConversationChat,
} from "@/components/context/ConversationContext";

import { createClient } from "@/lib/supabase/client";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

type Group<T> = {
  title: string;
  chats: T[];
};

function researchTitle(chat: ResearchJob) {
  const query = chat.query?.trim();

  if (query) {
    return query;
  }

  if (chat.pdf_filename) {
    return chat.pdf_filename;
  }

  return "Untitled research";
}

function groupByDate<T>(
  items: T[],
  getDate: (item: T) => string | undefined
): Group<T>[] {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() - 7
  );

  const today: T[] = [];
  const previous: T[] = [];
  const older: T[] = [];

  for (const item of items) {
    const value = getDate(item);

    if (!value) {
      older.push(item);
      continue;
    }

    const timestamp =
      new Date(value).getTime();

    if (
      timestamp >=
      startOfToday.getTime()
    ) {
      today.push(item);
    } else if (
      timestamp >=
      sevenDaysAgo.getTime()
    ) {
      previous.push(item);
    } else {
      older.push(item);
    }
  }

  const groups: Group<T>[] = [];

  if (today.length) {
    groups.push({
      title: "Today",
      chats: today,
    });
  }

  if (previous.length) {
    groups.push({
      title: "Previous 7 days",
      chats: previous,
    });
  }

  if (older.length) {
    groups.push({
      title: "Older",
      chats: older,
    });
  }

  return groups;
}

export default function Sidebar({
  collapsed,
  onToggle,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    chats: researchChats,
    activeChatId: activeResearchId,
    historyLoading: researchLoading,
    newChat: newResearch,
    selectChat: selectResearch,
  } = useResearch();

  const {
    chats: conversationChats,
    activeChatId: activeConversationId,
    historyLoading: conversationLoading,
    newChat: newConversation,
    selectChat: selectConversation,
  } = useConversation();

  const [search, setSearch] =
    useState("");

  const [userName, setUserName] =
    useState("User");

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const [mounted, setMounted] =
    useState(false);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const profileRef =
    useRef<HTMLDivElement>(null);

  /*
   * ============================================================
   * MOUNT
   * ============================================================
   */

  useEffect(() => {
    setMounted(true);
  }, []);

  const isConversation =
    mounted &&
    pathname?.startsWith(
      "/conversation"
    );

  const isResearch =
    mounted &&
    pathname?.startsWith(
      "/workspace"
    );

  /*
   * ============================================================
   * AUTHENTICATION
   * ============================================================
   */

  useEffect(() => {
    let alive = true;

    const supabase =
      createClient();

    async function loadAuth() {
      try {
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (!alive) {
          return;
        }

        setIsAuthenticated(
          Boolean(session?.user)
        );

        if (session?.user) {
          const metadata =
            session.user.user_metadata ??
            {};

          const name =
            metadata.username ||
            metadata.full_name ||
            metadata.name ||
            metadata.user_name ||
            session.user.email?.split(
              "@"
            )[0] ||
            "User";

          setUserName(name);
        }
      } catch (error) {
        console.error(
          "Failed to load authentication state:",
          error
        );
      } finally {
        if (alive) {
          setAuthLoading(false);
        }
      }
    }

    loadAuth();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        async (
          event,
          session
        ) => {
          if (!alive) {
            return;
          }

          const user =
            session?.user;

          setIsAuthenticated(
            Boolean(user)
          );

          if (!user) {
            setUserName("User");
            setProfileOpen(false);
            return;
          }

          const metadata =
            user.user_metadata ??
            {};

          const name =
            metadata.username ||
            metadata.full_name ||
            metadata.name ||
            metadata.user_name ||
            user.email?.split(
              "@"
            )[0] ||
            "User";

          setUserName(name);

          if (
            event ===
              "SIGNED_IN" ||
            event ===
              "USER_UPDATED"
          ) {
            setProfileOpen(false);
          }
        }
      );

    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * ============================================================
   * CLOSE PROFILE MENU
   * ============================================================
   */

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node
        )
      ) {
        setProfileOpen(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    if (profileOpen) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.addEventListener(
        "keydown",
        handleEscape
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [profileOpen]);

  /*
   * ============================================================
   * AUTH NAVIGATION
   * ============================================================
   */

  function openLogin() {
    setProfileOpen(false);
    router.push("/login");
  }

  function openSignup() {
    setProfileOpen(false);
    router.push("/signup");
  }

  /*
   * ============================================================
   * SIGN OUT
   * ============================================================
   */

  async function handleSignOut() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      const supabase =
        createClient();

      const {
        error,
      } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setIsAuthenticated(false);
      setUserName("User");
      setProfileOpen(false);

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(
        "Failed to sign out:",
        error
      );

      setLoggingOut(false);
    }
  }

  /*
   * ============================================================
   * FILTER RESEARCH
   * ============================================================
   */

  const filteredResearch =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return researchChats;
      }

      return researchChats.filter(
        (chat) => {
          const title =
            researchTitle(
              chat
            ).toLowerCase();

          const filename =
            chat.pdf_filename
              ?.toLowerCase() ?? "";

          return (
            title.includes(value) ||
            filename.includes(value)
          );
        }
      );
    }, [
      researchChats,
      search,
    ]);

  /*
   * ============================================================
   * FILTER CONVERSATIONS
   * ============================================================
   */

  const filteredConversation =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return conversationChats;
      }

      return conversationChats.filter(
        (chat) =>
          chat.title
            .toLowerCase()
            .includes(value)
      );
    }, [
      conversationChats,
      search,
    ]);

  /*
   * ============================================================
   * GROUP HISTORY
   * ============================================================
   */

  const researchGroups =
    useMemo(
      () =>
        groupByDate(
          filteredResearch,
          (chat) =>
            chat.created_at
        ),
      [filteredResearch]
    );

  const conversationGroups =
    useMemo(
      () =>
        groupByDate(
          filteredConversation,
          (chat) =>
            chat.updated_at
        ),
      [filteredConversation]
    );

  /*
   * ============================================================
   * NAVIGATION
   * ============================================================
   */

  function openResearch() {
    setProfileOpen(false);
    router.push("/workspace");
  }

  function openConversation() {
    setProfileOpen(false);
    router.push("/conversation");
  }

  async function handleNewChat() {
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    setProfileOpen(false);

    if (isConversation) {
      const id =
        await newConversation();

      if (id) {
        router.push(
          `/conversation?chat=${encodeURIComponent(
            id
          )}`
        );
      }

      return;
    }

    newResearch();

    router.push("/workspace");
  }

  async function openResearchChat(
    id: string
  ) {
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    setProfileOpen(false);

    await selectResearch(id);

    router.push("/workspace");
  }

  async function openConversationChat(
    id: string
  ) {
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    setProfileOpen(false);

    await selectConversation(id);

    router.push(
      `/conversation?chat=${encodeURIComponent(
        id
      )}`
    );
  }

  /*
   * ============================================================
   * COLLAPSED SIDEBAR
   * ============================================================
   */

  if (collapsed) {
    return (
      <aside
        className="
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-[64px]
          flex-col
          border-r
          border-white/[0.06]
          bg-[#0b0b0f]
        "
      >
        {/* EXPAND */}

        <div className="flex h-16 items-center justify-center">
          <button
            type="button"
            onClick={onToggle}
            aria-label="Expand sidebar"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              text-slate-400
              transition
              hover:bg-white/[0.06]
              hover:text-white
            "
          >
            <ChevronRight size={19} />
          </button>
        </div>

        {/* NEW CHAT */}

        <div className="px-2">
          <button
            type="button"
            onClick={handleNewChat}
            title={
              isAuthenticated
                ? isConversation
                  ? "New conversation"
                  : "New research"
                : "Log in to start"
            }
            className="
              flex
              h-10
              w-full
              items-center
              justify-center
              rounded-xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              text-slate-400
              transition
              hover:bg-white/[0.07]
              hover:text-white
            "
          >
            <Plus size={18} />
          </button>
        </div>

        {/* MODES */}

        <div className="mt-3 flex flex-col gap-1 px-2">
          <button
            type="button"
            onClick={openResearch}
            title="Deep Research"
            className={[
              "flex h-10 items-center justify-center rounded-xl transition",
              isResearch
                ? "bg-white/[0.08] text-cyan-400"
                : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200",
            ].join(" ")}
          >
            <FlaskConical size={18} />
          </button>

          <button
            type="button"
            onClick={openConversation}
            title="Conversation"
            className={[
              "flex h-10 items-center justify-center rounded-xl transition",
              isConversation
                ? "bg-white/[0.08] text-violet-400"
                : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200",
            ].join(" ")}
          >
            <MessageCircle size={18} />
          </button>
        </div>

        {/* RECENT CHATS */}

        {isAuthenticated && (
          <div
            className="
              mt-4
              flex
              min-h-0
              flex-1
              flex-col
              gap-1
              overflow-hidden
              px-2
            "
          >
            {isConversation &&
              filteredConversation
                .slice(0, 7)
                .map((chat) => (
                  <button
                    key={
                      chat.chat_id
                    }
                    type="button"
                    title={
                      chat.title
                    }
                    onClick={() =>
                      openConversationChat(
                        chat.chat_id
                      )
                    }
                    className={[
                      "flex h-10 w-full shrink-0 items-center justify-center rounded-xl transition",
                      chat.chat_id ===
                      activeConversationId
                        ? "bg-white/[0.08] text-white"
                        : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200",
                    ].join(" ")}
                  >
                    <MessageSquare
                      size={17}
                    />
                  </button>
                ))}

            {isResearch &&
              filteredResearch
                .slice(0, 7)
                .map((chat) => (
                  <button
                    key={
                      chat.job_id
                    }
                    type="button"
                    title={researchTitle(
                      chat
                    )}
                    onClick={() =>
                      openResearchChat(
                        chat.job_id
                      )
                    }
                    className={[
                      "flex h-10 w-full shrink-0 items-center justify-center rounded-xl transition",
                      chat.job_id ===
                      activeResearchId
                        ? "bg-white/[0.08] text-white"
                        : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200",
                    ].join(" ")}
                  >
                    <MessageSquare
                      size={17}
                    />
                  </button>
                ))}
          </div>
        )}

        {/* LOGGED OUT AUTH */}

        {!authLoading &&
          !isAuthenticated && (
            <div className="mt-auto px-2 pb-3">
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={openLogin}
                  title="Log in"
                  className="
                    flex
                    h-10
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/[0.07]
                    bg-white/[0.025]
                    text-slate-400
                    transition
                    hover:border-cyan-400/20
                    hover:bg-cyan-400/[0.05]
                    hover:text-cyan-400
                  "
                >
                  <LogIn size={17} />
                </button>

                <button
                  type="button"
                  onClick={openSignup}
                  title="Sign up"
                  className="
                    flex
                    h-10
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    bg-cyan-400
                    text-[#061014]
                    transition
                    hover:bg-cyan-300
                  "
                >
                  <UserPlus size={17} />
                </button>
              </div>
            </div>
          )}

        {/* PROFILE */}

        {isAuthenticated && (
          <div
            ref={profileRef}
            className="
              relative
              flex
              items-center
              justify-center
              px-2
              pb-3
            "
          >
            {profileOpen && (
              <div
                className="
                  absolute
                  bottom-[58px]
                  left-[68px]
                  z-[100]
                  w-56
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.09]
                  bg-[#111318]
                  p-1.5
                  shadow-[0_20px_60px_rgba(0,0,0,0.55)]
                "
              >
                <div
                  className="
                    border-b
                    border-white/[0.06]
                    px-3
                    py-3
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-cyan-400/[0.08]
                        text-cyan-400
                      "
                    >
                      <UserCircle
                        size={19}
                      />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          truncate
                          text-sm
                          font-medium
                          text-white
                        "
                      >
                        {userName}
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[11px]
                          text-slate-500
                        "
                      >
                        Researcher
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    handleSignOut
                  }
                  disabled={
                    loggingOut
                  }
                  className="
                    mt-1
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    text-slate-300
                    transition
                    hover:bg-red-500/[0.08]
                    hover:text-red-300
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <LogOut size={16} />

                  <span>
                    {loggingOut
                      ? "Signing out..."
                      : "Sign out"}
                  </span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (open) => !open
                )
              }
              aria-label="Open profile menu"
              aria-expanded={
                profileOpen
              }
              title={userName}
              className={[
                "flex h-10 w-full items-center justify-center rounded-xl transition",
                profileOpen
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200",
              ].join(" ")}
            >
              <UserCircle
                size={19}
              />
            </button>
          </div>
        )}
      </aside>
    );
  }

  /*
   * ============================================================
   * EXPANDED SIDEBAR
   * ============================================================
   */

  return (
    <aside
      className="
        fixed
        left-0
        top-0
        z-50
        flex
        h-screen
        w-[260px]
        flex-col
        border-r
        border-white/[0.06]
        bg-[#0b0b0f]
      "
    >
      {/* HEADER */}

      <div className="flex h-16 shrink-0 items-center px-3">
        <div className="flex min-w-0 flex-1 items-center gap-3 px-2">
          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-cyan-400/10
            "
          >
            <MessageSquare
              size={17}
              className="text-cyan-400"
            />
          </div>

          <span
            className="
              truncate
              text-sm
              font-semibold
              tracking-tight
              text-white
            "
          >
            DeepResearch
          </span>
        </div>

        <button
          type="button"
          onClick={onToggle}
          aria-label="Collapse sidebar"
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-slate-500
            transition
            hover:bg-white/[0.06]
            hover:text-white
          "
        >
          <ChevronLeft size={19} />
        </button>
      </div>

      {/* MODE */}

      <div className="px-3">
        <div
          className="
            space-y-1
            rounded-xl
            bg-white/[0.025]
            p-1
          "
        >
          {/* DEEP RESEARCH */}

          <button
            type="button"
            onClick={openResearch}
            className={[
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
              isResearch
                ? "bg-white/[0.08] text-white"
                : "text-slate-400 hover:bg-white/[0.045] hover:text-slate-200",
            ].join(" ")}
          >
            <FlaskConical
              size={17}
              className={
                isResearch
                  ? "text-cyan-400"
                  : "text-slate-500"
              }
            />

            <div className="min-w-0">
              <p className="text-[13px] font-medium">
                Deep Research
              </p>

              <p className="mt-0.5 text-[10px] text-slate-600">
                Autonomous research
              </p>
            </div>
          </button>

          {/* CONVERSATION */}

          <button
            type="button"
            onClick={openConversation}
            className={[
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
              isConversation
                ? "bg-white/[0.08] text-white"
                : "text-slate-400 hover:bg-white/[0.045] hover:text-slate-200",
            ].join(" ")}
          >
            <MessageCircle
              size={17}
              className={
                isConversation
                  ? "text-violet-400"
                  : "text-slate-500"
              }
            />

            <div className="min-w-0">
              <p className="text-[13px] font-medium">
                Conversation
              </p>

              <p className="mt-0.5 text-[10px] text-slate-600">
                Chat naturally
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ===================================================== */}
      {/* LOGGED IN UI */}
      {/* ===================================================== */}

      {isAuthenticated ? (
        <>
          {/* NEW */}

          <div className="px-3 pt-3">
            <button
              type="button"
              onClick={
                handleNewChat
              }
              className="
                flex
                h-11
                w-full
                items-center
                gap-3
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.025]
                px-3
                text-sm
                font-medium
                text-slate-200
                transition
                hover:border-white/[0.14]
                hover:bg-white/[0.06]
              "
            >
              <Plus size={18} />

              <span>
                {isConversation
                  ? "New conversation"
                  : "New research"}
              </span>
            </button>
          </div>

          {/* SEARCH */}

          <div className="px-3 pt-3">
            <div
              className="
                flex
                h-10
                items-center
                gap-2
                rounded-xl
                bg-white/[0.025]
                px-3
              "
            >
              <Search
                size={16}
                className="shrink-0 text-slate-500"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder={
                  isConversation
                    ? "Search conversations"
                    : "Search research"
                }
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-slate-600
                "
              />
            </div>
          </div>

          {/* HISTORY */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              px-2
              pb-3
              pt-5
            "
          >
            {isConversation ? (
              <ConversationHistory
                groups={
                  conversationGroups
                }
                loading={
                  conversationLoading
                }
                activeChatId={
                  activeConversationId
                }
                onOpen={
                  openConversationChat
                }
              />
            ) : (
              <ResearchHistory
                groups={
                  researchGroups
                }
                loading={
                  researchLoading
                }
                activeChatId={
                  activeResearchId
                }
                onOpen={
                  openResearchChat
                }
              />
            )}
          </div>

          {/* PROFILE */}

          <div
            ref={profileRef}
            className="
              relative
              shrink-0
              border-t
              border-white/[0.06]
              p-2
            "
          >
            {/* PROFILE MENU */}

            {profileOpen && (
              <div
                className="
                  absolute
                  bottom-[70px]
                  left-2
                  right-2
                  z-[100]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.09]
                  bg-[#111318]
                  p-1.5
                  shadow-[0_20px_60px_rgba(0,0,0,0.55)]
                "
              >
                <div
                  className="
                    border-b
                    border-white/[0.06]
                    px-3
                    py-3
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-cyan-400/[0.08]
                        text-cyan-400
                      "
                    >
                      <UserCircle
                        size={19}
                      />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          truncate
                          text-sm
                          font-medium
                          text-white
                        "
                      >
                        {userName}
                      </p>

                      <p
                        className="
                          mt-0.5
                          text-[11px]
                          text-slate-500
                        "
                      >
                        Researcher
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    handleSignOut
                  }
                  disabled={
                    loggingOut
                  }
                  className="
                    mt-1
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    text-slate-300
                    transition
                    hover:bg-red-500/[0.08]
                    hover:text-red-300
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <LogOut size={16} />

                  <span>
                    {loggingOut
                      ? "Signing out..."
                      : "Sign out"}
                  </span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (open) => !open
                )
              }
              aria-label="Open profile menu"
              aria-expanded={
                profileOpen
              }
              title={userName}
              className={[
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-slate-400 transition hover:bg-white/[0.05] hover:text-white",
                profileOpen
                  ? "bg-white/[0.07] text-white"
                  : "",
              ].join(" ")}
            >
              <UserCircle size={18} />

              <div className="min-w-0">
                <p className="truncate text-sm text-slate-300">
                  {userName}
                </p>

                <p className="text-[10px] text-slate-600">
                  Researcher
                </p>
              </div>
            </button>
          </div>
        </>
      ) : (
        /*
         * ========================================================
         * LOGGED OUT UI
         * ========================================================
         */

        <div className="flex min-h-0 flex-1 flex-col">
          {/* PUBLIC WORKSPACE MESSAGE */}

          <div className="px-3 pt-5">
            <div
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.07]
                bg-white/[0.025]
                p-4
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-8
                  -top-8
                  h-24
                  w-24
                  rounded-full
                  bg-cyan-400/[0.05]
                  blur-2xl
                "
              />

              <div className="relative">
                <div
                  className="
                    mb-3
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-cyan-400/10
                    bg-cyan-400/[0.06]
                    text-cyan-400
                  "
                >
                  <UserCircle
                    size={18}
                  />
                </div>

                <p className="text-sm font-medium text-white">
                  Welcome to DeepResearch
                </p>

                <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                  Log in to save research,
                  access your history, and
                  start conversations.
                </p>
              </div>
            </div>
          </div>

          {/* EMPTY HISTORY */}

          <div className="flex flex-1 items-center justify-center px-6">
            <div className="text-center">
              <Clock3
                size={22}
                className="mx-auto mb-3 text-slate-700"
              />

              <p className="text-xs leading-5 text-slate-600">
                Your research history
                <br />
                will appear here after
                you sign in.
              </p>
            </div>
          </div>

          {/* AUTH BUTTONS */}

          <div className="shrink-0 border-t border-white/[0.06] p-3">
            <button
              type="button"
              onClick={openLogin}
              className="
                flex
                h-10
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-white/[0.08]
                bg-white/[0.025]
                text-sm
                font-medium
                text-slate-300
                transition
                hover:border-white/[0.14]
                hover:bg-white/[0.055]
                hover:text-white
              "
            >
              <LogIn size={16} />

              <span>
                Log in
              </span>
            </button>

            <button
              type="button"
              onClick={openSignup}
              className="
                mt-2
                flex
                h-10
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-cyan-400
                text-sm
                font-semibold
                text-[#061014]
                shadow-[0_8px_25px_rgba(34,211,238,0.12)]
                transition
                hover:bg-cyan-300
                hover:shadow-[0_10px_30px_rgba(34,211,238,0.18)]
              "
            >
              <UserPlus size={16} />

              <span>
                Sign up
              </span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

// ============================================================
// RESEARCH HISTORY
// ============================================================

function ResearchHistory({
  groups,
  loading,
  activeChatId,
  onOpen,
}: {
  groups: Group<ResearchJob>[];
  loading: boolean;
  activeChatId: string | null;
  onOpen: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-2 px-2">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="
                h-10
                animate-pulse
                rounded-lg
                bg-white/[0.035]
              "
            />
          )
        )}
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className="px-4 pt-8 text-center">
        <Clock3
          size={22}
          className="
            mx-auto
            mb-3
            text-slate-700
          "
        />

        <p className="text-sm text-slate-500">
          Your research history
          will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(
        (group) => (
          <section
            key={group.title}
          >
            <div
              className="
                px-3
                pb-2
                text-[11px]
                font-semibold
                uppercase
                tracking-wider
                text-slate-600
              "
            >
              {group.title}
            </div>

            <div className="space-y-0.5">
              {group.chats.map(
                (chat) => {
                  const active =
                    chat.job_id ===
                    activeChatId;

                  return (
                    <button
                      key={
                        chat.job_id
                      }
                      type="button"
                      onClick={() =>
                        onOpen(
                          chat.job_id
                        )
                      }
                      className={[
                        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
                        active
                          ? "bg-white/[0.08] text-white"
                          : "text-slate-400 hover:bg-white/[0.045] hover:text-slate-200",
                      ].join(" ")}
                    >
                      <MessageSquare
                        size={15}
                        className={
                          active
                            ? "text-cyan-400"
                            : "text-slate-600"
                        }
                      />

                      <span
                        className="
                          min-w-0
                          flex-1
                          truncate
                          text-[13px]
                        "
                      >
                        {researchTitle(
                          chat
                        )}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </section>
        )
      )}
    </div>
  );
}

// ============================================================
// CONVERSATION HISTORY
// ============================================================

function ConversationHistory({
  groups,
  loading,
  activeChatId,
  onOpen,
}: {
  groups: Group<ConversationChat>[];
  loading: boolean;
  activeChatId: string | null;
  onOpen: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-2 px-2">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="
                h-10
                animate-pulse
                rounded-lg
                bg-white/[0.035]
              "
            />
          )
        )}
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className="px-4 pt-8 text-center">
        <MessageCircle
          size={22}
          className="
            mx-auto
            mb-3
            text-slate-700
          "
        />

        <p className="text-sm text-slate-500">
          Your conversations
          will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(
        (group) => (
          <section
            key={group.title}
          >
            <div
              className="
                px-3
                pb-2
                text-[11px]
                font-semibold
                uppercase
                tracking-wider
                text-slate-600
              "
            >
              {group.title}
            </div>

            <div className="space-y-0.5">
              {group.chats.map(
                (chat) => {
                  const active =
                    chat.chat_id ===
                    activeChatId;

                  return (
                    <button
                      key={
                        chat.chat_id
                      }
                      type="button"
                      onClick={() =>
                        onOpen(
                          chat.chat_id
                        )
                      }
                      className={[
                        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition",
                        active
                          ? "bg-white/[0.08] text-white"
                          : "text-slate-400 hover:bg-white/[0.045] hover:text-slate-200",
                      ].join(" ")}
                    >
                      <MessageSquare
                        size={15}
                        className={
                          active
                            ? "text-violet-400"
                            : "text-slate-600"
                        }
                      />

                      <span
                        className="
                          min-w-0
                          flex-1
                          truncate
                          text-[13px]
                        "
                      >
                        {chat.title ||
                          "New conversation"}
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          </section>
        )
      )}
    </div>
  );
}