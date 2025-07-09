"use client";

import { useEffect, useState } from "react";

// Basic types for the data we'll be handling
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

// A simple component to render the email list
const EmailList = ({
  emails,
  onEmailSelect,
}: {
  emails: Email[];
  onEmailSelect: (id: string) => void;
}) => (
  <div style={{ borderRight: "1px solid #e0e0e0" }}>
    <h2
      style={{ padding: "16px", borderBottom: "1px solid #e0e0e0", margin: 0 }}
    >
      Inbox
    </h2>
    <ul>
      {emails.map((email) => (
        <li
          key={email.id}
          onClick={() => onEmailSelect(email.id)}
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #f0f0f0",
            cursor: "pointer",
          }}
        >
          <p style={{ margin: 0, fontWeight: 500, color: "#000" }}>
            {email.fromData?.name || email.fromData?.email || "Unknown Sender"}
          </p>
          <p style={{ margin: "4px 0", fontWeight: 500 }}>{email.subject}</p>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#666" }}>
            {email.snippet}
          </p>
        </li>
      ))}
    </ul>
  </div>
);

// The main dashboard component
export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);

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

      // Refresh the email list
      await fetchEmails();
      setSelectedEmail(null); // Clear selection
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Error</h2>
        <p>{error}</p>
        <a href="/">Go to Homepage</a>
      </div>
    );
  }

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr 2fr",
        height: "100vh",
      }}
    >
      {/* Column 1: Account Info */}
      <div style={{ borderRight: "1px solid #e0e0e0", padding: "16px" }}>
        <h3>Accounts</h3>
        <p>{profile.name}</p>
        <p style={{ color: "#666" }}>{profile.email}</p>
      </div>

      {/* Column 2: Email List */}
      <EmailList emails={emails} onEmailSelect={handleEmailSelect} />

      {/* Column 3: Detailed Email View */}
      <div style={{ padding: "16px", overflowY: "auto" }}>
        {isLoadingEmail ? (
          <p>Loading email...</p>
        ) : selectedEmail ? (
          <div>
            <div style={{ marginBottom: "1rem", display: "flex", gap: "8px" }}>
              <button
                onClick={() => handleModifyEmail(selectedEmail.id, "archive")}
              >
                Archive
              </button>
              <button
                onClick={() => handleModifyEmail(selectedEmail.id, "trash")}
              >
                Delete
              </button>
              <button
                onClick={() => handleModifyEmail(selectedEmail.id, "spam")}
              >
                Spam
              </button>
            </div>
            <h3>{selectedEmail.subject}</h3>
            <p>
              <strong>From: </strong>
              {selectedEmail.fromData?.name} ({selectedEmail.fromData?.email})
            </p>
            <hr />
            {/* 
              TODO: Sanitize this HTML to prevent XSS attacks.
              Using a library like DOMPurify is highly recommended.
              Example: <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedEmail.bodyHtml) }} />
            */}
            <div
              dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml ?? "" }}
            />
          </div>
        ) : (
          <p>Select an email to view its content.</p>
        )}
      </div>
    </div>
  );
}
