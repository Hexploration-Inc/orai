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
  Bold,
  Italic,
  Link as LinkIcon,
  Paperclip,
  X,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/app/components/theme-toggle";

// TipTap extensions
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";

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

// Helper functions
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Loading skeletons
const EmailListSkeleton = () => (
  <div className="space-y-1 p-2">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-64" />
      </div>
    ))}
  </div>
);

const EmailDetailSkeleton = () => (
  <div className="h-full p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-64" />
      <div className="flex space-x-2">
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
      </div>
    </div>
    <Skeleton className="h-4 w-48" />
    <Separator />
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
);

// Empty states
const EmptyEmailList = () => (
  <div className="flex flex-col items-center justify-center h-64 text-center p-6">
    <Mail className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">No emails found</h3>
    <p className="text-sm text-muted-foreground">
      Your inbox is empty or emails are still loading.
    </p>
  </div>
);

const EmptyEmailDetail = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-6">
    <MailOpen className="h-16 w-16 text-muted-foreground mb-4" />
    <h3 className="text-xl font-semibold mb-2">Select an email</h3>
    <p className="text-muted-foreground">
      Choose an email from the list to read its contents.
    </p>
  </div>
);

// Components
const MailboxNav = ({ mailboxes }: { mailboxes: Mailbox[] }) => (
  <div className="p-4 space-y-2">
    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
      Mailboxes
    </h2>
    {mailboxes.map((mailbox) => {
      const Icon = mailbox.icon;
      return (
        <div
          key={mailbox.name}
          className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
            mailbox.active
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center space-x-3">
            <Icon size={18} />
            <span className="text-sm font-medium">{mailbox.name}</span>
          </div>
          {mailbox.count !== undefined && (
            <span className="text-xs bg-muted-foreground/20 text-muted-foreground px-2 py-1 rounded-full">
              {mailbox.count}
            </span>
          )}
        </div>
      );
    })}
  </div>
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
    <div className="h-full overflow-y-auto">
      {emails.map((email) => (
        <div key={email.id}>
          <div
            onClick={() => onEmailSelect(email.id)}
            className={`p-4 cursor-pointer transition-colors border-l-2 ${
              selectedEmailId === email.id
                ? "bg-muted border-l-blue-500"
                : "border-l-transparent hover:bg-muted/50"
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {!email.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm truncate ${
                      !email.isRead ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {email.fromData?.name || email.fromData?.email || "Unknown"}
                  </p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                {email.date}
              </span>
            </div>
            <h3
              className={`text-sm mb-1 line-clamp-1 ${
                !email.isRead ? "font-semibold" : "font-normal"
              }`}
            >
              {email.subject || "No subject"}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {email.snippet || "No preview available"}
            </p>
          </div>
          <Separator />
        </div>
      ))}
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
      <div className="h-full flex flex-col bg-background">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold line-clamp-2 mb-1">
              {email.subject || "No subject"}
            </h2>
            <p className="text-sm text-muted-foreground">
              From:{" "}
              <span className="font-medium">
                {email.fromData?.name || "Unknown"}
              </span>
              <span className="mx-2">•</span>
              <span>{email.date}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onModify(email.id, "archive")}
                  className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
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
                  className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
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

// Editor toolbar
const EditorToolbar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-muted transition-colors ${
          editor.isActive("bold")
            ? "bg-muted text-foreground"
            : "text-muted-foreground"
        }`}
        title="Bold"
      >
        <Bold size={16} />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-muted transition-colors ${
          editor.isActive("italic")
            ? "bg-muted text-foreground"
            : "text-muted-foreground"
        }`}
        title="Italic"
      >
        <Italic size={16} />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      {editor.isActive("link") ? (
        <button
          onClick={removeLink}
          className="p-2 rounded hover:bg-muted transition-colors bg-muted text-foreground"
          title="Remove Link"
        >
          <LinkIcon size={16} />
        </button>
      ) : (
        <button
          onClick={addLink}
          className="p-2 rounded hover:bg-muted transition-colors text-muted-foreground"
          title="Add Link"
        >
          <LinkIcon size={16} />
        </button>
      )}

      <div className="flex-1" />

      <select
        onChange={(e) => {
          const value = e.target.value;
          if (value === "paragraph") {
            editor.chain().focus().setParagraph().run();
          } else {
            const level = parseInt(value);
            editor.chain().focus().toggleHeading({ level }).run();
          }
        }}
        className="text-xs bg-transparent border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring text-muted-foreground"
        value={
          editor.isActive("heading", { level: 1 })
            ? "1"
            : editor.isActive("heading", { level: 2 })
              ? "2"
              : editor.isActive("heading", { level: 3 })
                ? "3"
                : "paragraph"
        }
      >
        <option value="paragraph">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>
    </div>
  );
};

// Compose view
const ComposeView = ({
  onSend,
  onClose,
  isPanel = false,
}: {
  onSend: (data: {
    to: string;
    subject: string;
    html: string;
    attachment?: File;
  }) => void;
  onClose: () => void;
  isPanel?: boolean;
}) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [attachment, setAttachment] = useState<File | undefined>();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:text-blue-800 underline",
        },
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 text-foreground",
      },
    },
  });

  const handleSend = () => {
    if (editor && to && subject) {
      onSend({
        to,
        subject,
        html: editor.getHTML(),
        attachment,
      });
      setTo("");
      setSubject("");
      setAttachment(undefined);
      editor.commands.clearContent();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSend();
    }
  };

  // Panel version for desktop
  if (isPanel) {
    return (
      <div
        className="h-full bg-background flex flex-col"
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <span className="font-semibold">New Message</span>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3 border-b">
          <div className="flex items-center">
            <label className="text-sm font-medium text-muted-foreground w-16">
              To:
            </label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1 px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
          <div className="flex items-center">
            <label className="text-sm font-medium text-muted-foreground w-16">
              Subject:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject..."
              className="flex-1 px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
        </div>

        <EditorToolbar editor={editor} />

        <div className="flex-1 overflow-hidden">
          <EditorContent editor={editor} className="h-full overflow-y-auto" />
        </div>

        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="file"
                id="attachment-panel"
                onChange={(e) => setAttachment(e.target.files?.[0])}
                className="hidden"
              />
              <label
                htmlFor="attachment-panel"
                className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer transition-colors"
              >
                <Paperclip size={16} />
                <span>Attach file</span>
              </label>
              {attachment && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {attachment.name}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-xs text-muted-foreground">
                Ctrl+Enter to send
              </div>
              <button
                onClick={handleSend}
                disabled={!to || !subject}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile overlay version
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-8 bg-card border rounded-lg shadow-lg p-3 cursor-pointer min-w-[200px] z-50">
        <div
          onClick={() => setIsMinimized(false)}
          className="flex items-center justify-between"
        >
          <span className="text-sm font-medium">New Message</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 hover:bg-muted rounded"
            >
              <Maximize2 size={14} />
            </button>
            <button onClick={onClose} className="p-1 hover:bg-muted rounded">
              <X size={14} />
            </button>
          </div>
        </div>
        {to && <p className="text-xs text-muted-foreground mt-1">To: {to}</p>}
      </div>
    );
  }

  return (
    <div
      className={`fixed bg-card border rounded-lg shadow-2xl flex flex-col transition-all z-50 ${
        isMaximized ? "inset-4" : "bottom-4 right-8 w-[600px] h-[500px]"
      }`}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between p-4 border-b bg-muted/30 rounded-t-lg">
        <span className="font-semibold">New Message</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          >
            <Minimize2 size={16} />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          >
            <Maximize2 size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 border-b">
        <div className="flex items-center">
          <label className="text-sm font-medium text-muted-foreground w-16">
            To:
          </label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
            className="flex-1 px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
        <div className="flex items-center">
          <label className="text-sm font-medium text-muted-foreground w-16">
            Subject:
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject..."
            className="flex-1 px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>
      </div>

      <EditorToolbar editor={editor} />

      <div className="flex-1 overflow-hidden">
        <EditorContent editor={editor} className="h-full overflow-y-auto" />
      </div>

      <div className="p-4 border-t bg-muted/30 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <input
              type="file"
              id="attachment-mobile"
              onChange={(e) => setAttachment(e.target.files?.[0])}
              className="hidden"
            />
            <label
              htmlFor="attachment-mobile"
              className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-pointer transition-colors"
            >
              <Paperclip size={16} />
              <span>Attach file</span>
            </label>
            {attachment && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                {attachment.name}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-xs text-muted-foreground">
              Ctrl+Enter to send
            </div>
            <button
              onClick={handleSend}
              disabled={!to || !subject}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile email detail
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
    <div className="fixed inset-0 bg-background z-50 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          ←
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onModify(email.id, "archive")}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <Archive size={18} />
          </button>
          <button
            onClick={() => onModify(email.id, "trash")}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="px-4 py-4">
        <h2 className="text-lg font-bold mb-2">{email.subject}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          From:{" "}
          <span className="font-medium">
            {email.fromData?.name || "Unknown"}
          </span>
        </p>
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: email.bodyHtml || "" }}
        />
      </div>
    </div>
  );
};

// Main dashboard component
export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mailboxes: Mailbox[] = [
    { name: "Inbox", icon: Inbox, count: emails.length, active: true },
    { name: "Sent", icon: Send, count: 12, active: false },
    { name: "Archive", icon: FileArchive, count: 8, active: false },
  ];

  const api = (url: string, options?: RequestInit) =>
    fetch(`http://localhost:3001/api${url}`, {
      credentials: "include",
      ...options,
    });

  const fetchEmails = async () => {
    setIsLoadingEmails(true);
    try {
      const res = await api("/emails");
      if (!res.ok) {
        throw new Error("Failed to fetch emails. Are you logged in?");
      }
      const data = await res.json();

      const emailsWithDate = data.map((email: any) => ({
        ...email,
        date: "Apr 22",
      }));

      setEmails(emailsWithDate);
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
    setShowMobileDetail(true);

    setEmails(emails.map((e) => (e.id === id ? { ...e, isRead: true } : e)));

    try {
      const res = await api(`/emails/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch email details.");
      }
      const data = await res.json();
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
      await fetchEmails();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-full p-6 mb-4 inline-block">
            <Mail className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
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
            {isComposing ? (
              <ComposeView
                onSend={handleSendEmail}
                onClose={() => setIsComposing(false)}
                isPanel={true}
              />
            ) : (
              <EmailDetail
                email={selectedEmail}
                onModify={handleModifyEmail}
                isLoading={isLoadingEmail}
              />
            )}
          </div>
        </Panel>
      </PanelGroup>

      {showMobileDetail && (
        <MobileEmailDetail
          email={selectedEmail}
          onModify={handleModifyEmail}
          onBack={() => setShowMobileDetail(false)}
          isLoading={isLoadingEmail}
        />
      )}

      {isComposing && (
        <div className="lg:hidden">
          <ComposeView
            onSend={handleSendEmail}
            onClose={() => setIsComposing(false)}
          />
        </div>
      )}
    </div>
  );
}
