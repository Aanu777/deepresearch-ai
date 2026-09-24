"use client";

import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  FlaskConical,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquare,
  Plus,
  Search,
  UserCircle,
  UserPlus,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
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

import {
  createClient,
} from "@/lib/supabase/client";

import {
  Button,
  IconButton,
  Input,
  Skeleton,
} from "@/components/ui";

// ============================================================
// TYPES
// ============================================================

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileOpen: () => void;
  onMobileClose: () => void;
};

type Group<T> = {
  title: string;
  chats: T[];
};

// ============================================================
// HELPERS
// ============================================================

function researchTitle(
  chat: ResearchJob
) {
  const query =
    chat.query?.trim();

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
  getDate: (
    item: T
  ) => string | undefined
): Group<T>[] {
  const now =
    new Date();

  const startOfToday =
    new Date(now);

  startOfToday.setHours(
    0,
    0,
    0,
    0
  );

  const sevenDaysAgo =
    new Date(
      startOfToday
    );

  sevenDaysAgo.setDate(
    sevenDaysAgo.getDate() -
      7
  );

  const today: T[] = [];
  const previous: T[] = [];
  const older: T[] = [];

  for (
    const item of items
  ) {
    const value =
      getDate(item);

    if (!value) {
      older.push(item);
      continue;
    }

    const timestamp =
      new Date(
        value
      ).getTime();

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

  const groups: Group<T>[] =
    [];

  if (today.length) {
    groups.push({
      title: "Today",
      chats: today,
    });
  }

  if (previous.length) {
    groups.push({
      title:
        "Previous 7 days",
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

// ============================================================
// SIDEBAR
// ============================================================

export default function Sidebar({
  collapsed,
  mobileOpen,
  onToggle,
  onMobileOpen,
  onMobileClose,
}: SidebarProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const {
    chats:
      researchChats,

    activeChatId:
      activeResearchId,

    historyLoading:
      researchLoading,

    newChat:
      newResearch,

    selectChat:
      selectResearch,
  } =
    useResearch();

  const {
    chats:
      conversationChats,

    activeChatId:
      activeConversationId,

    historyLoading:
      conversationLoading,

    newChat:
      newConversation,

    selectChat:
      selectConversation,
  } =
    useConversation();

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    userName,
    setUserName,
  ] =
    useState("User");

  const [
    profileOpen,
    setProfileOpen,
  ] =
    useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] =
    useState(false);

  const [
    mounted,
    setMounted,
  ] =
    useState(false);

  const [
    authLoading,
    setAuthLoading,
  ] =
    useState(true);

  const [
    isAuthenticated,
    setIsAuthenticated,
  ] =
    useState(false);

  const profileRef =
    useRef<HTMLDivElement>(
      null
    );

  // ==========================================================
  // MOUNT
  // ==========================================================

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

  // ==========================================================
  // AUTH
  // ==========================================================

  useEffect(() => {
    let alive = true;

    const supabase =
      createClient();

    async function loadAuth() {
      try {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();

        if (!alive) {
          return;
        }

        setIsAuthenticated(
          Boolean(
            session?.user
          )
        );

        if (
          session?.user
        ) {
          const metadata =
            session.user
              .user_metadata ??
            {};

          const name =
            metadata.username ||
            metadata.full_name ||
            metadata.name ||
            metadata.user_name ||
            session.user.email
              ?.split("@")[0] ||
            "User";

          setUserName(
            name
          );
        }

      } catch (error) {
        console.error(
          "Failed to load authentication state:",
          error
        );

      } finally {
        if (alive) {
          setAuthLoading(
            false
          );
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
        (
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
            setUserName(
              "User"
            );

            setProfileOpen(
              false
            );

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
            user.email
              ?.split("@")[0] ||
            "User";

          setUserName(
            name
          );

          if (
            event ===
              "SIGNED_IN" ||
            event ===
              "USER_UPDATED"
          ) {
            setProfileOpen(
              false
            );
          }
        }
      );

    return () => {
      alive = false;

      subscription.unsubscribe();
    };
  }, []);

  // ==========================================================
  // PROFILE MENU
  // ==========================================================

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
        setProfileOpen(
          false
        );
      }
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setProfileOpen(
          false
        );

        onMobileClose();
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

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
  }, [
    onMobileClose,
  ]);

  // ==========================================================
  // CLOSE MOBILE ON ROUTE CHANGE
  // ==========================================================

  useEffect(() => {
    onMobileClose();
  }, [
    pathname,
  ]);

  // ==========================================================
  // AUTH NAVIGATION
  // ==========================================================

  function openLogin() {
    setProfileOpen(
      false
    );

    onMobileClose();

    router.push(
      "/login"
    );
  }

  function openSignup() {
    setProfileOpen(
      false
    );

    onMobileClose();

    router.push(
      "/signup"
    );
  }

  async function handleSignOut() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(
      true
    );

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

      setIsAuthenticated(
        false
      );

      setUserName(
        "User"
      );

      setProfileOpen(
        false
      );

      onMobileClose();

      router.replace(
        "/login"
      );

      router.refresh();

    } catch (error) {
      console.error(
        "Failed to sign out:",
        error
      );

      setLoggingOut(
        false
      );
    }
  }

  // ==========================================================
  // FILTER
  // ==========================================================

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
              ?.toLowerCase() ??
            "";

          return (
            title.includes(
              value
            ) ||
            filename.includes(
              value
            )
          );
        }
      );
    }, [
      researchChats,
      search,
    ]);

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
            .includes(
              value
            )
      );
    }, [
      conversationChats,
      search,
    ]);

  const researchGroups =
    useMemo(
      () =>
        groupByDate(
          filteredResearch,
          (chat) =>
            chat.created_at
        ),
      [
        filteredResearch,
      ]
    );

  const conversationGroups =
    useMemo(
      () =>
        groupByDate(
          filteredConversation,
          (chat) =>
            chat.updated_at
        ),
      [
        filteredConversation,
      ]
    );

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  function openResearch() {
    setSearch("");

    setProfileOpen(
      false
    );

    onMobileClose();

    router.push(
      "/workspace"
    );
  }

  function openConversation() {
    setSearch("");

    setProfileOpen(
      false
    );

    onMobileClose();

    router.push(
      "/conversation"
    );
  }

  async function handleNewChat() {
    if (
      !isAuthenticated
    ) {
      openLogin();
      return;
    }

    setProfileOpen(
      false
    );

    onMobileClose();

    if (
      isConversation
    ) {
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

    router.push(
      "/workspace"
    );
  }

  async function openResearchChat(
    id: string
  ) {
    if (
      !isAuthenticated
    ) {
      openLogin();
      return;
    }

    onMobileClose();

    await selectResearch(
      id
    );

    router.push(
      "/workspace"
    );
  }

  async function openConversationChat(
    id: string
  ) {
    if (
      !isAuthenticated
    ) {
      openLogin();
      return;
    }

    onMobileClose();

    await selectConversation(
      id
    );

    router.push(
      `/conversation?chat=${encodeURIComponent(
        id
      )}`
    );
  }

  // ==========================================================
  // MOBILE BUTTON
  // ==========================================================

  const mobileTrigger = (
    <IconButton
      onClick={
        onMobileOpen
      }
      aria-label="Open sidebar"
      className="
        fixed
        left-3
        top-3
        z-40
        border
        border-white/[0.08]
        bg-[#111111]/90
        shadow-lg
        backdrop-blur-xl
        lg:hidden
      "
    >
      <Menu
        size={18}
      />
    </IconButton>
  );

  // ==========================================================
  // MOBILE
  // ==========================================================

  const mobileSidebar = (
    <MobileSidebar
      open={
        mobileOpen
      }
      onClose={
        onMobileClose
      }
    >
      <ExpandedContent
        isAuthenticated={
          isAuthenticated
        }
        authLoading={
          authLoading
        }
        isResearch={
          isResearch
        }
        isConversation={
          isConversation
        }
        search={
          search
        }
        setSearch={
          setSearch
        }
        researchGroups={
          researchGroups
        }
        conversationGroups={
          conversationGroups
        }
        researchLoading={
          researchLoading
        }
        conversationLoading={
          conversationLoading
        }
        activeResearchId={
          activeResearchId
        }
        activeConversationId={
          activeConversationId
        }
        userName={
          userName
        }
        profileOpen={
          profileOpen
        }
        setProfileOpen={
          setProfileOpen
        }
        loggingOut={
          loggingOut
        }
        profileRef={
          profileRef
        }
        handleNewChat={
          handleNewChat
        }
        openResearch={
          openResearch
        }
        openConversation={
          openConversation
        }
        openResearchChat={
          openResearchChat
        }
        openConversationChat={
          openConversationChat
        }
        openLogin={
          openLogin
        }
        openSignup={
          openSignup
        }
        handleSignOut={
          handleSignOut
        }
        mobile
        onMobileClose={
          onMobileClose
        }
      />
    </MobileSidebar>
  );

  // ==========================================================
  // COLLAPSED
  // ==========================================================

  if (collapsed) {
    return (
      <>
        {mobileTrigger}
        {mobileSidebar}

        <aside
          className="
            fixed
            left-0
            top-0
            z-50
            hidden
            h-screen
            w-[68px]
            flex-col
            border-r
            border-white/[0.06]
            bg-[#0d0d0d]
            lg:flex
          "
        >
          <div className="flex h-14 items-center justify-center">
            <IconButton
              onClick={
                onToggle
              }
              size="sm"
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <ChevronRight
                size={17}
              />
            </IconButton>
          </div>

          <div className="px-3">
            <IconButton
              onClick={
                handleNewChat
              }
              title={
                isConversation
                  ? "New conversation"
                  : "New research"
              }
              className="w-full"
            >
              <Plus
                size={18}
              />
            </IconButton>
          </div>

          <div className="mt-3 space-y-1 px-3">
            <CollapsedModeButton
              active={
                isConversation
              }
              label="Conversation"
              onClick={
                openConversation
              }
            >
              <MessageCircle
                size={17}
              />
            </CollapsedModeButton>

            <CollapsedModeButton
              active={
                isResearch
              }
              label="Deep Research"
              onClick={
                openResearch
              }
            >
              <FlaskConical
                size={17}
              />
            </CollapsedModeButton>
          </div>

          {isAuthenticated && (
            <div className="mt-4 flex min-h-0 flex-1 flex-col gap-1 overflow-hidden px-3">
              {isConversation &&
                filteredConversation
                  .slice(
                    0,
                    8
                  )
                  .map(
                    (chat) => (
                      <CollapsedHistoryButton
                        key={
                          chat.chat_id
                        }
                        active={
                          chat.chat_id ===
                          activeConversationId
                        }
                        title={
                          chat.title
                        }
                        onClick={() =>
                          openConversationChat(
                            chat.chat_id
                          )
                        }
                      />
                    )
                  )}

              {isResearch &&
                filteredResearch
                  .slice(
                    0,
                    8
                  )
                  .map(
                    (chat) => (
                      <CollapsedHistoryButton
                        key={
                          chat.job_id
                        }
                        active={
                          chat.job_id ===
                          activeResearchId
                        }
                        title={researchTitle(
                          chat
                        )}
                        onClick={() =>
                          openResearchChat(
                            chat.job_id
                          )
                        }
                      />
                    )
                  )}
            </div>
          )}

          <div className="mt-auto px-3 pb-3">
            <IconButton
              onClick={
                isAuthenticated
                  ? () =>
                      setProfileOpen(
                        (value) =>
                          !value
                      )
                  : openLogin
              }
              className="w-full"
              title={
                isAuthenticated
                  ? userName
                  : "Log in"
              }
            >
              {isAuthenticated ? (
                <UserCircle
                  size={19}
                />
              ) : (
                <LogIn
                  size={18}
                />
              )}
            </IconButton>
          </div>
        </aside>
      </>
    );
  }

  // ==========================================================
  // EXPANDED
  // ==========================================================

  return (
    <>
      {mobileTrigger}
      {mobileSidebar}

      <aside
        className="
          fixed
          left-0
          top-0
          z-50
          hidden
          h-screen
          w-[248px]
          border-r
          border-white/[0.06]
          bg-[#0d0d0d]
          lg:block
        "
      >
        <ExpandedContent
          isAuthenticated={
            isAuthenticated
          }
          authLoading={
            authLoading
          }
          isResearch={
            isResearch
          }
          isConversation={
            isConversation
          }
          search={
            search
          }
          setSearch={
            setSearch
          }
          researchGroups={
            researchGroups
          }
          conversationGroups={
            conversationGroups
          }
          researchLoading={
            researchLoading
          }
          conversationLoading={
            conversationLoading
          }
          activeResearchId={
            activeResearchId
          }
          activeConversationId={
            activeConversationId
          }
          userName={
            userName
          }
          profileOpen={
            profileOpen
          }
          setProfileOpen={
            setProfileOpen
          }
          loggingOut={
            loggingOut
          }
          profileRef={
            profileRef
          }
          handleNewChat={
            handleNewChat
          }
          openResearch={
            openResearch
          }
          openConversation={
            openConversation
          }
          openResearchChat={
            openResearchChat
          }
          openConversationChat={
            openConversationChat
          }
          openLogin={
            openLogin
          }
          openSignup={
            openSignup
          }
          handleSignOut={
            handleSignOut
          }
          onCollapse={
            onToggle
          }
        />
      </aside>
    </>
  );
}

// ============================================================
// EXPANDED CONTENT
// ============================================================

type ExpandedContentProps = {
  isAuthenticated: boolean;
  authLoading: boolean;

  isResearch: boolean;
  isConversation: boolean;

  search: string;

  setSearch: (
    value: string
  ) => void;

  researchGroups:
    Group<ResearchJob>[];

  conversationGroups:
    Group<ConversationChat>[];

  researchLoading: boolean;
  conversationLoading: boolean;

  activeResearchId:
    string | null;

  activeConversationId:
    string | null;

  userName: string;

  profileOpen: boolean;

  setProfileOpen: (
    value:
      | boolean
      | ((
          previous:
            boolean
        ) => boolean)
  ) => void;

  loggingOut: boolean;

  profileRef:
    RefObject<HTMLDivElement | null>;

  handleNewChat:
    () => Promise<void>;

  openResearch: () => void;

  openConversation: () => void;

  openResearchChat:
    (
      id: string
    ) => Promise<void>;

  openConversationChat:
    (
      id: string
    ) => Promise<void>;

  openLogin: () => void;

  openSignup: () => void;

  handleSignOut:
    () => Promise<void>;

  onCollapse?: () => void;

  mobile?: boolean;

  onMobileClose?: () => void;
};

function ExpandedContent({
  isAuthenticated,
  authLoading,

  isResearch,
  isConversation,

  search,
  setSearch,

  researchGroups,
  conversationGroups,

  researchLoading,
  conversationLoading,

  activeResearchId,
  activeConversationId,

  userName,

  profileOpen,
  setProfileOpen,

  loggingOut,

  profileRef,

  handleNewChat,

  openResearch,
  openConversation,

  openResearchChat,
  openConversationChat,

  openLogin,
  openSignup,

  handleSignOut,

  onCollapse,

  mobile = false,

  onMobileClose,
}: ExpandedContentProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* HEADER */}

      <div className="flex h-14 shrink-0 items-center gap-2 px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 px-1">
          <span className="h-2 w-2 shrink-0 rounded-full bg-cyan-400" />

          <span className="truncate text-sm font-semibold tracking-tight text-white/90">
            DeepResearch
          </span>
        </div>

        {mobile ? (
          <IconButton
            size="sm"
            onClick={
              onMobileClose
            }
            aria-label="Close sidebar"
          >
            <X
              size={17}
            />
          </IconButton>
        ) : (
          onCollapse && (
            <IconButton
              size="sm"
              onClick={
                onCollapse
              }
              aria-label="Collapse sidebar"
            >
              <ChevronLeft
                size={17}
              />
            </IconButton>
          )
        )}
      </div>

      {/* NEW */}

      <div className="px-3 pt-1">
        <Button
          variant="ghost"
          fullWidth
          onClick={
            handleNewChat
          }
          className="justify-start"
        >
          <Plus
            size={17}
          />

          {isConversation
            ? "New chat"
            : "New research"}
        </Button>
      </div>

      {/* MODES */}

      <div className="mt-1 space-y-0.5 px-3">
        <ModeButton
          active={
            isConversation
          }
          icon={
            <MessageCircle
              size={17}
            />
          }
          label="Conversation"
          onClick={
            openConversation
          }
        />

        <ModeButton
          active={
            isResearch
          }
          icon={
            <FlaskConical
              size={17}
            />
          }
          label="Deep Research"
          onClick={
            openResearch
          }
        />
      </div>

      {isAuthenticated ? (
        <>
          {/* SEARCH */}

          <div className="relative px-3 pt-4">
            <Search
              size={15}
              className="
                pointer-events-none
                absolute
                left-6
                top-[26px]
                z-10
                text-white/25
              "
            />

            <Input
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search"
              className="
                h-9
                bg-white/[0.035]
                pl-9
                text-xs
              "
            />
          </div>

          {/* HISTORY */}

          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 pt-5">
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

          {/* ACCOUNT */}

          <div
            ref={
              profileRef
            }
            className="
              relative
              shrink-0
              border-t
              border-white/[0.06]
              p-2
            "
          >
            {profileOpen && (
              <div
                className="
                  absolute
                  bottom-[64px]
                  left-2
                  right-2
                  z-[100]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/[0.09]
                  bg-[#1d1d1d]
                  p-1.5
                  shadow-[0_24px_80px_rgba(0,0,0,0.52)]
                "
              >
                <div className="border-b border-white/[0.06] px-3 py-3">
                  <p className="truncate text-sm font-medium text-white/90">
                    {userName}
                  </p>

                  <p className="mt-1 text-[11px] text-white/30">
                    DeepResearch account
                  </p>
                </div>

                <Button
                  variant="danger"
                  fullWidth
                  onClick={
                    handleSignOut
                  }
                  disabled={
                    loggingOut
                  }
                  className="
                    mt-1
                    justify-start
                  "
                >
                  <LogOut
                    size={16}
                  />

                  {loggingOut
                    ? "Signing out..."
                    : "Sign out"}
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              fullWidth
              onClick={() =>
                setProfileOpen(
                  (
                    previous
                  ) =>
                    !previous
                )
              }
              className="justify-start"
            >
              <UserCircle
                size={18}
              />

              <span className="truncate">
                {userName}
              </span>
            </Button>
          </div>
        </>
      ) : (
        <LoggedOutState
          authLoading={
            authLoading
          }
          openLogin={
            openLogin
          }
          openSignup={
            openSignup
          }
        />
      )}
    </div>
  );
}

// ============================================================
// MODE BUTTON
// ============================================================

function ModeButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      fullWidth
      onClick={
        onClick
      }
      className={`
        justify-start
        ${
          active
            ? "bg-white/[0.07] text-white"
            : ""
        }
      `}
    >
      <span
        className={
          active
            ? "text-white/80"
            : "text-white/30"
        }
      >
        {icon}
      </span>

      {label}
    </Button>
  );
}

// ============================================================
// COLLAPSED MODE
// ============================================================

function CollapsedModeButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <IconButton
      onClick={
        onClick
      }
      title={
        label
      }
      className={`
        w-full
        ${
          active
            ? "bg-white/[0.08] text-white"
            : ""
        }
      `}
    >
      {children}
    </IconButton>
  );
}

// ============================================================
// COLLAPSED HISTORY
// ============================================================

function CollapsedHistoryButton({
  active,
  title,
  onClick,
}: {
  active: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <IconButton
      onClick={
        onClick
      }
      title={
        title
      }
      className={`
        w-full
        ${
          active
            ? "bg-white/[0.08] text-white"
            : ""
        }
      `}
    >
      <MessageSquare
        size={16}
      />
    </IconButton>
  );
}

// ============================================================
// MOBILE SIDEBAR
// ============================================================

function MobileSidebar({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[80]
        lg:hidden
      "
    >
      <button
        type="button"
        onClick={
          onClose
        }
        aria-label="Close sidebar"
        className="
          absolute
          inset-0
          bg-black/60
          backdrop-blur-[2px]
        "
      />

      <aside
        className="
          relative
          z-10
          h-full
          w-[280px]
          max-w-[88vw]
          border-r
          border-white/[0.07]
          bg-[#0d0d0d]
          shadow-[20px_0_70px_rgba(0,0,0,0.45)]
        "
      >
        {children}
      </aside>
    </div>
  );
}

// ============================================================
// LOGGED OUT
// ============================================================

function LoggedOutState({
  authLoading,
  openLogin,
  openSignup,
}: {
  authLoading: boolean;
  openLogin: () => void;
  openSignup: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 items-center justify-center px-7 text-center">
        <div>
          <Clock3
            size={20}
            className="mx-auto mb-3 text-white/15"
          />

          <p className="text-xs leading-5 text-white/30">
            Sign in to save your
            conversations and research
            history.
          </p>
        </div>
      </div>

      {!authLoading && (
        <div className="border-t border-white/[0.06] p-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={
              openLogin
            }
          >
            <LogIn
              size={16}
            />

            Log in
          </Button>

          <Button
            variant="primary"
            fullWidth
            onClick={
              openSignup
            }
            className="mt-2"
          >
            <UserPlus
              size={16}
            />

            Sign up
          </Button>
        </div>
      )}
    </div>
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
  groups:
    Group<ResearchJob>[];
  loading: boolean;
  activeChatId:
    string | null;
  onOpen:
    (
      id: string
    ) => void;
}) {
  if (loading) {
    return (
      <HistorySkeleton />
    );
  }

  if (!groups.length) {
    return (
      <EmptyHistory
        label="No research yet"
      />
    );
  }

  return (
    <div className="space-y-5">
      {groups.map(
        (group) => (
          <section
            key={
              group.title
            }
          >
            <HistoryHeading>
              {group.title}
            </HistoryHeading>

            <div className="space-y-0.5">
              {group.chats.map(
                (chat) => (
                  <HistoryItem
                    key={
                      chat.job_id
                    }
                    active={
                      chat.job_id ===
                      activeChatId
                    }
                    title={researchTitle(
                      chat
                    )}
                    onClick={() =>
                      onOpen(
                        chat.job_id
                      )
                    }
                  />
                )
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
  groups:
    Group<ConversationChat>[];
  loading: boolean;
  activeChatId:
    string | null;
  onOpen:
    (
      id: string
    ) => void;
}) {
  if (loading) {
    return (
      <HistorySkeleton />
    );
  }

  if (!groups.length) {
    return (
      <EmptyHistory
        label="No conversations yet"
      />
    );
  }

  return (
    <div className="space-y-5">
      {groups.map(
        (group) => (
          <section
            key={
              group.title
            }
          >
            <HistoryHeading>
              {group.title}
            </HistoryHeading>

            <div className="space-y-0.5">
              {group.chats.map(
                (chat) => (
                  <HistoryItem
                    key={
                      chat.chat_id
                    }
                    active={
                      chat.chat_id ===
                      activeChatId
                    }
                    title={
                      chat.title ||
                      "New conversation"
                    }
                    onClick={() =>
                      onOpen(
                        chat.chat_id
                      )
                    }
                  />
                )
              )}
            </div>
          </section>
        )
      )}
    </div>
  );
}

// ============================================================
// HISTORY ITEM
// ============================================================

function HistoryItem({
  active,
  title,
  onClick,
}: {
  active: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      title={
        title
      }
      className={`
        flex
        w-full
        items-center
        rounded-lg
        px-3
        py-2
        text-left
        text-[13px]
        transition-colors
        duration-150
        ${
          active
            ? "bg-white/[0.07] text-white/90"
            : "text-white/45 hover:bg-white/[0.04] hover:text-white/75"
        }
      `}
    >
      <span className="min-w-0 flex-1 truncate">
        {title}
      </span>
    </button>
  );
}

// ============================================================
// HISTORY HEADING
// ============================================================

function HistoryHeading({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="px-3 pb-1.5 text-[10px] font-medium text-white/25">
      {children}
    </div>
  );
}

// ============================================================
// HISTORY SKELETON
// ============================================================

function HistorySkeleton() {
  return (
    <div className="space-y-2 px-2">
      {[1, 2, 3, 4].map(
        (item) => (
          <Skeleton
            key={
              item
            }
            className="h-8"
          />
        )
      )}
    </div>
  );
}

// ============================================================
// EMPTY
// ============================================================

function EmptyHistory({
  label,
}: {
  label: string;
}) {
  return (
    <div className="px-4 pt-8 text-center">
      <p className="text-xs text-white/25">
        {label}
      </p>
    </div>
  );
}