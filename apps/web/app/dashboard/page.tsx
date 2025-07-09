"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Archive, Trash2, Mail } from "lucide-react";

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
}

// Components
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
    <ul className="overflow-y-auto h-full pb-20">
      {emails.map((email) => (
        <li
          key={email.id}
          onClick={() => onEmailSelect(email.id)}
          className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
            selectedEmailId === email.id ? "bg-blue-100" : ""
          }`}
        >
          <p className="font-semibold text-gray-800 truncate">
            {email.fromData?.name || email.fromData?.email || "Unknown Sender"}
          </p>
          <p className="font-medium text-gray-900 truncate">{email.subject}</p>
          <p className="text-sm text-gray-500 truncate">{email.snippet}</p>
        </li>
      ))}
    </ul>
  </div>
);

const EmailDetail = ({
  email,
  onModify,
}: {
  email: Email;
  onModify: (id: string, action: "archive" | "trash" | "spam") => void;
}) => (
  <div className="h-full flex flex-col">
    <div className="p-4 border-b flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold">{email.subject}</h2>
        <p className="text-sm text-gray-600">
          From: {email.fromData?.name || "Unknown"} &lt;
          {email.fromData?.email}&gt;
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onModify(email.id, "archive")}
          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full"
          title="Archive"
        >
          <Archive size={20} />
        </button>
        <button
          onClick={() => onModify(email.id, "trash")}
          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full"
          title="Trash"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
    <div
      className="p-4 prose max-w-none flex-1 overflow-y-auto"
      dangerouslySetInnerHTML={{ __html: email.bodyHtml || "" }}
    />
  </div>
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
    <div className="fixed bottom-0 right-8 w-[500px] h-[400px] bg-white border border-gray-300 rounded-t-lg shadow-2xl flex flex-col">
      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center rounded-t-lg">
        <span className="font-semibold">New Message</span>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          &times;
        </button>
      </div>
      <div className="p-2 space-y-2">
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To"
          className="w-full px-2 py-1 border-b focus:outline-none"
        />
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full px-2 py-1 border-b focus:outline-none"
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
      setEmails(emailsData);
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
    try {
      const res = await api(`/emails/${id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch email details.");
      }
      const data = await res.json();
      setSelectedEmail(data);
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
    <div className="h-screen bg-white">
      <header className="flex items-center justify-between p-2 border-b">
        <div className="font-semibold text-lg">Orai</div>
        <div className="flex items-center space-x-4">
          <span>{profile.email}</span>
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
          <div className="p-4 h-full">
            <h3 className="font-semibold">Folders</h3>
            {/* Placeholder for mailboxes */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 p-2 bg-blue-100 rounded-md">
                <Mail size={18} />
                <span>Inbox</span>
              </div>
            </div>
          </div>
        </Panel>
        <PanelResizeHandle className="w-px bg-gray-200" />
        <Panel defaultSize={30} minSize={20}>
          <EmailList
            emails={emails}
            onEmailSelect={handleEmailSelect}
            selectedEmailId={selectedEmail?.id || null}
          />
        </Panel>
        <PanelResizeHandle className="w-px bg-gray-200" />
        <Panel defaultSize={50} minSize={30}>
          <div className="h-full">
            {isLoadingEmail && (
              <div className="flex items-center justify-center h-full">
                Loading email...
              </div>
            )}
            {!isLoadingEmail && !selectedEmail && (
              <div className="flex items-center justify-center h-full text-gray-500">
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
