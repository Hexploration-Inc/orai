"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Archive, Trash2, Mail, Inbox, Send, FileArchive } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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

// Helper to get initials from a name
const getInitials = (name: string) => {
  const names = name.split(" ");
  if (names.length > 1) {
    return `${names[0]?.[0]}${names[names.length - 1]?.[0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Components
const MailboxNav = () => (
  <div className="p-2 space-y-1">
    <a
      href="#"
      className="flex items-center space-x-3 px-3 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-md"
    >
      <Inbox size={18} />
      <span>Inbox</span>
    </a>
    <a
      href="#"
      className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md"
    >
      <FileArchive size={18} />
      <span>Archived</span>
    </a>
    <a
      href="#"
      className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md"
    >
      <Send size={18} />
      <span>Sent</span>
    </a>
  </div>
);

const EmailList = ({
  emails,
  onEmailSelect,
  selectedEmailId,
}: {
  emails: Email[];
  onEmailSelect: (id: string) => void;
  selectedEmailId: string | null;
}) => (
  <div className="h-full">
    <div className="p-4 border-b">
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
              className={`flex items-start p-4 cursor-pointer group hover:bg-muted/50 ${
                selectedEmailId === email.id ? "bg-accent" : ""
              }`}
            >
              {!email.isRead && (
                <div className="w-2 h-2 bg-primary rounded-full mr-3 mt-2" />
              )}
              <Avatar className="mr-4">
                <AvatarFallback>{getInitials(fromName)}</AvatarFallback>
              </Avatar>
              <div
                className={`flex-1 overflow-hidden ${
                  !email.isRead ? "pl-0" : "pl-5"
                }`}
              >
                <div className="flex justify-between items-baseline">
                  <p
                    className={`font-semibold truncate ${
                      !email.isRead ? "" : "text-muted-foreground"
                    }`}
                  >
                    {fromName}
                  </p>
                  <span
                    className={`text-xs ${
                      !email.isRead
                        ? "text-foreground"
                        : "text-muted-foreground"
                    } group-hover:text-foreground`}
                  >
                    {email.date}
                  </span>
                </div>
                <p className="font-medium truncate">{email.subject}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {email.snippet}
                </p>
              </div>
            </div>
            <Separator />
          </div>
        );
      })}
    </div>
  </div>
);

const EmailDetail = ({
  email,
  onModify,
}: {
  email: Email;
  onModify: (id: string, action: "archive" | "trash" | "spam") => void;
}) => (
  <TooltipProvider>
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{email.subject}</h2>
          <p className="text-sm text-muted-foreground">
            From: {email.fromData?.name || "Unknown"} &lt;
            {email.fromData?.email}&gt;
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onModify(email.id, "archive")}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
              >
                <Archive size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => onModify(email.id, "trash")}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
              >
                <Trash2 size={20} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Trash</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div
        className="p-4 prose dark:prose-invert max-w-none flex-1 overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: email.bodyHtml || "" }}
      />
    </div>
  </TooltipProvider>
);

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

// The main dashboard component
export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const api = (url: string, options?: RequestInit) =>
    fetch(`http://localhost:3001/api${url}`, {
      ...options,
      credentials: "include",
    });

  const fetchEmails = async () => {
    try {
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-2 border-b">
        <div className="font-semibold text-lg">Orai</div>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
          </Avatar>
          <ThemeToggle />
          <button
            onClick={() => setIsComposing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Compose
          </button>
        </div>
      </header>

      <PanelGroup direction="horizontal" className="h-[calc(100vh-57px)]">
        <Panel defaultSize={20} minSize={15}>
          <MailboxNav />
        </Panel>
        <PanelResizeHandle className="w-px bg-border" />
        <Panel defaultSize={30} minSize={20}>
          <EmailList
            emails={emails}
            onEmailSelect={handleEmailSelect}
            selectedEmailId={selectedEmail?.id || null}
          />
        </Panel>
        <PanelResizeHandle className="w-px bg-border" />
        <Panel defaultSize={50} minSize={30}>
          <div className="h-full">
            {isLoadingEmail && (
              <div className="flex items-center justify-center h-full">
                Loading email...
              </div>
            )}
            {!isLoadingEmail && !selectedEmail && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select an email to read
              </div>
            )}
            {!isLoadingEmail && selectedEmail && (
              <EmailDetail email={selectedEmail} onModify={handleModifyEmail} />
            )}
          </div>
        </Panel>
      </PanelGroup>

      {isComposing && (
        <ComposeView
          onSend={handleSendEmail}
          onClose={() => setIsComposing(false)}
        />
      )}
    </div>
  );
}
