"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import {
  Archive,
  Trash2,
  Inbox,
  Send,
  FileArchive,
  Mail,
  MailOpen,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/app/components/theme-toggle";

// Types
interface UserProfile {
  email: string;
  name: string;
}

interface Email {
  id: string;
  subject: string | null;
  snippet: string | null;
  fromData: { name?: string; email?: string } | null;
  bodyHtml?: string | null;
  isRead: boolean;
  date: string;
}

interface Mailbox {
  name: string;
  icon: React.ElementType;
  count?: number;
  active: boolean;
}

// Helper to get initials from a name
const getInitials = (name: string) => {
  const names = name.split(" ");
  if (names.length > 1) {
    return `${names[0]?.[0]}${names[names.length - 1]?.[0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Loading Skeleton Components
const EmailListSkeleton = () => (
  <div className="h-full">
    <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
      <Skeleton className="h-6 w-16" />
    </div>
    <div className="p-4 space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-start space-x-3">
          <div className="w-5 flex-shrink-0">
            <Skeleton className="h-2 w-2 rounded-full" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const EmailDetailSkeleton = () => (
  <div className="h-full flex flex-col">
    <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
      <Skeleton className="h-7 w-80 mb-3" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="p-6 space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

// Empty State Components
const EmptyEmailList = () => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full p-6 mb-6">
      <MailOpen className="h-12 w-12 text-neutral-400 dark:text-neutral-600" />
    </div>
    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
      No emails found
    </h3>
    <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
      Your inbox is empty. When you receive emails, they'll appear here.
    </p>
  </div>
);

const EmptyEmailDetail = () => (
  <div className="h-full flex flex-col items-center justify-center text-center p-8">
    <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full p-6 mb-6">
      <Mail className="h-12 w-12 text-neutral-400 dark:text-neutral-600" />
    </div>
    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
      Select an email
    </h3>
    <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
      Choose an email from the list to view its contents here.
    </p>
  </div>
);

// Components
const MailboxNav = ({ mailboxes }: { mailboxes: Mailbox[] }) => (
  <nav className="p-3 space-y-1">
    {mailboxes.map((mailbox) => (
      <a
        key={mailbox.name}
        href="#"
        className={`flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
          mailbox.active
            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-100"
        }`}
      >
        <div className="flex items-center space-x-3">
          <mailbox.icon size={18} />
          <span className="font-medium">{mailbox.name}</span>
        </div>
        {mailbox.count ? (
          <span className="px-2 py-0.5 text-xs font-semibold bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full">
            {mailbox.count}
          </span>
        ) : null}
      </a>
    ))}
  </nav>
);

const EmailList = ({
  emails,
  onEmailSelect,
  selectedEmailId,
  isLoading,
}: {
  emails: Email[];
  onEmailSelect: (id: string) => void;
  selectedEmailId: string | null;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return <EmailListSkeleton />;
  }

  if (emails.length === 0) {
    return <EmptyEmailList />;
  }

  return (
    <div className="h-full">
      <div className="px-6 py-4 border-b">
        <h2 className="text-xl font-bold">Inbox</h2>
      </div>
      <div className="overflow-y-auto h-full pb-20">
        {emails.map((email) => {
          const fromName =
            email.fromData?.name || email.fromData?.email || "Unknown";
          return (
            <div key={email.id}>
              <div
                onClick={() => onEmailSelect(email.id)}
                className={`flex items-start px-6 py-4 cursor-pointer group hover:bg-muted/50 transition-colors ${
                  selectedEmailId === email.id ? "bg-accent" : ""
                }`}
              >
                <div className="w-5 flex-shrink-0 mr-4">
                  {!email.isRead && (
                    <div className="w-2.5 h-2.5 mt-2 bg-blue-500 rounded-full" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <p
                      className={`truncate text-sm font-medium leading-5 ${
                        email.isRead
                          ? "text-muted-foreground"
                          : "text-foreground font-semibold"
                      }`}
                    >
                      {fromName}
                    </p>
                    <span
                      className={`text-xs flex-shrink-0 ml-4 ${
                        email.isRead
                          ? "text-muted-foreground"
                          : "text-foreground font-medium"
                      } group-hover:text-foreground`}
                    >
                      {email.date}
                    </span>
                  </div>
                  <p
                    className={`truncate text-sm mb-1 leading-5 ${
                      email.isRead
                        ? "text-muted-foreground"
                        : "font-semibold text-foreground"
                    }`}
                  >
                    {email.subject}
                  </p>
                  <p className="text-xs text-muted-foreground truncate leading-4">
                    {email.snippet}
                  </p>
                </div>
              </div>
              <Separator className="mx-6" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EmailDetail = ({
  email,
  onModify,
  isLoading,
}: {
  email: Email | null;
  onModify: (id: string, action: "archive" | "trash" | "spam") => void;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return <EmailDetailSkeleton />;
  }

  if (!email) {
    return <EmptyEmailDetail />;
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 leading-7">
              {email.subject}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-5">
              From:{" "}
              <span className="font-medium">
                {email.fromData?.name || "Unknown"}
              </span>{" "}
              &lt;{email.fromData?.email}&gt;
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onModify(email.id, "archive")}
                  className="p-2.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <Archive size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Archive</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onModify(email.id, "trash")}
                  className="p-2.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div
          className="px-6 py-6 prose dark:prose-invert max-w-none flex-1 overflow-y-auto prose-sm prose-neutral dark:prose-neutral"
          dangerouslySetInnerHTML={{ __html: email.bodyHtml || "" }}
        />
      </div>
    </TooltipProvider>
  );
};

const ComposeView = ({
  onSend,
  onClose,
}: {
  onSend: (data: {
    to: string;
    subject: string;
    html: string;
    attachment?: File;
  }) => void;
  onClose: () => void;
}) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [attachment, setAttachment] = useState<File | undefined>();

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert focus:outline-none min-h-[150px] max-w-full",
      },
    },
  });

  const handleSend = () => {
    if (editor) {
      onSend({ to, subject, html: editor.getHTML(), attachment });
    }
  };

  return (
    <div className="fixed bottom-0 right-8 w-[500px] h-[400px] bg-card border rounded-t-lg shadow-2xl flex flex-col">
      <div className="bg-muted px-4 py-2 flex justify-between items-center rounded-t-lg">
        <span className="font-semibold">New Message</span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          &times;
        </button>
      </div>
      <div className="p-2 space-y-2">
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To"
          className="w-full px-2 py-1 bg-transparent border-b focus:outline-none"
        />
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full px-2 py-1 bg-transparent border-b focus:outline-none"
        />
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      <div className="px-4 py-2 border-t">
        <input
          type="file"
          onChange={(e) => setAttachment(e.target.files?.[0])}
          className="text-sm"
        />
      </div>
      <button
        onClick={handleSend}
        className="w-full py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700"
      >
        Send
      </button>
    </div>
  );
};

const MobileEmailDetail = ({
  email,
  onModify,
  onBack,
  isLoading,
}: {
  email: Email | null;
  onModify: (id: string, action: "archive" | "trash" | "spam") => void;
  onBack: () => void;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return <EmailDetailSkeleton />;
  }

  if (!email) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-neutral-950 z-50 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={onBack}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
        >
          ←
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onModify(email.id, "archive")}
            className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Archive size={18} />
          </button>
          <button
            onClick={() => onModify(email.id, "trash")}
            className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="px-4 py-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {email.subject}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          From:{" "}
          <span className="font-medium">
            {email.fromData?.name || "Unknown"}
          </span>{" "}
          &lt;{email.fromData?.email}&gt;
        </p>
      </div>
      <div
        className="px-4 prose dark:prose-invert max-w-none flex-1 overflow-y-auto prose-sm"
        dangerouslySetInnerHTML={{ __html: email.bodyHtml || "" }}
      />
    </div>
  );
};

// The main dashboard component
export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // MOCK DATA: For mailboxes
  const mailboxes: Mailbox[] = [
    {
      name: "Inbox",
      icon: Inbox,
      count: emails.filter((e) => !e.isRead).length,
      active: true,
    },
    { name: "Sent", icon: Send, active: false },
    { name: "Archived", icon: FileArchive, active: false },
  ];

  const api = (url: string, options?: RequestInit) =>
    fetch(`http://localhost:3001/api${url}`, {
      ...options,
      credentials: "include",
    });

  const fetchEmails = async () => {
    try {
      setIsLoadingEmails(true);
      const emailsRes = await api("/emails");
      if (!emailsRes.ok) {
        throw new Error("Failed to fetch emails.");
      }
      const emailsData = await emailsRes.json();
      // MOCK DATA: Add isRead and date for styling
      const processedEmails = emailsData.map((email: any, index: number) => ({
        ...email,
        isRead: index % 3 !== 0, // Mock some as unread
        date: "Apr 22", // Mock date
      }));
      setEmails(processedEmails);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await api("/me");
        if (!profileRes.ok) {
          throw new Error("Failed to fetch profile. Are you logged in?");
        }
        setProfile(await profileRes.json());
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchProfile();
    fetchEmails();
  }, []);

  const handleEmailSelect = async (id: string) => {
    if (selectedEmail?.id === id) return;
    setIsLoadingEmail(true);
    setSelectedEmail(null);
    setShowMobileDetail(true); // Show mobile detail on selection

    // Mark as read on the frontend immediately for better UX
    setEmails(emails.map((e) => (e.id === id ? { ...e, isRead: true } : e)));

    try {
      const res = await api(`/emails/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch email details.");
      }
      const data = await res.json();
      // Add the mocked fields to the selected email as well
      setSelectedEmail({ ...data, isRead: true, date: "Apr 22" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleModifyEmail = async (
    id: string,
    action: "archive" | "trash" | "spam"
  ) => {
    try {
      const res = await api(`/emails/${id}/modify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        throw new Error(`Failed to ${action} email.`);
      }
      toast(`Email moved to ${action}.`);
      await fetchEmails();
      setSelectedEmail(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSendEmail = async (data: {
    to: string;
    subject: string;
    html: string;
    attachment?: File;
  }) => {
    const formData = new FormData();
    formData.append("to", data.to);
    formData.append("subject", data.subject);
    formData.append("html", data.html);
    if (data.attachment) {
      formData.append("attachment", data.attachment);
    }

    try {
      const res = await api("/emails/send", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to send email.");
      }
      toast("Email sent successfully!");
      setIsComposing(false);
      await fetchEmails(); // Refresh email list
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-neutral-950">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-full p-6 mb-4 inline-block">
            <Mail className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Something went wrong
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-neutral-950">
        <div className="text-center">
          <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
          <Skeleton className="h-6 w-32 mx-auto mb-2" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-background">
        <h1 className="text-lg sm:text-xl font-bold">Orai</h1>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:flex">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-sm">
                {getInitials(profile.name)}
              </AvatarFallback>
            </Avatar>
          </div>
          <ThemeToggle />
          <button
            onClick={() => setIsComposing(true)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background"
          >
            <span className="hidden sm:inline">Compose</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </header>

      <PanelGroup
        direction="horizontal"
        className="h-[calc(100vh-57px)] sm:h-[calc(100vh-73px)]"
      >
        <Panel defaultSize={20} minSize={15} className="hidden md:block">
          <div className="bg-background h-full">
            <MailboxNav mailboxes={mailboxes} />
          </div>
        </Panel>
        <PanelResizeHandle className="w-px bg-border hover:w-px hover:bg-blue-500 transition-colors hidden md:block" />
        <Panel defaultSize={30} minSize={20} className="md:defaultSize-30">
          <div className="bg-background h-full">
            <EmailList
              emails={emails}
              onEmailSelect={handleEmailSelect}
              selectedEmailId={selectedEmail?.id || null}
              isLoading={isLoadingEmails}
            />
          </div>
        </Panel>
        <PanelResizeHandle className="w-px bg-border hover:w-px hover:bg-blue-500 transition-colors hidden lg:block" />
        <Panel defaultSize={50} minSize={30} className="hidden lg:block">
          <div className="h-full bg-background">
            <EmailDetail
              email={selectedEmail}
              onModify={handleModifyEmail}
              isLoading={isLoadingEmail}
            />
          </div>
        </Panel>
      </PanelGroup>

      {/* Mobile Email Detail Overlay */}
      {showMobileDetail && (
        <MobileEmailDetail
          email={selectedEmail}
          onModify={handleModifyEmail}
          onBack={() => setShowMobileDetail(false)}
          isLoading={isLoadingEmail}
        />
      )}

      {isComposing && (
        <ComposeView
          onSend={handleSendEmail}
          onClose={() => setIsComposing(false)}
        />
      )}
    </div>
  );
}
