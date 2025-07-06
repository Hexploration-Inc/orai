"use client";

import { useEffect, useState } from "react";

// Basic types for the data we'll be handling
interface UserProfile {
  emailAddress: string;
}

interface Email {
  id: string;
  snippet: string;
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
          <p style={{ margin: 0, fontWeight: 500 }}>
            Email Subject Placeholder
          </p>
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
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // We need to include our session cookie in requests to the API
    const api = (url: string) =>
      fetch(`http://localhost:3001/api${url}`, { credentials: "include" });

    const fetchData = async () => {
      try {
        const [profileRes, emailsRes] = await Promise.all([
          api("/me"),
          api("/emails"),
        ]);

        if (!profileRes.ok || !emailsRes.ok) {
          throw new Error("Failed to fetch data. Are you logged in?");
        }

        const profileData = await profileRes.json();
        const emailsData = await emailsRes.json();

        setProfile(profileData);
        setEmails(emailsData.messages || []);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

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
        <p>{profile.emailAddress}</p>
      </div>

      {/* Column 2: Email List */}
      <EmailList emails={emails} onEmailSelect={setSelectedEmailId} />

      {/* Column 3: Detailed Email View */}
      <div style={{ padding: "16px" }}>
        {selectedEmailId ? (
          <p>Showing email with ID: {selectedEmailId}</p>
        ) : (
          <p>Select an email to view its content.</p>
        )}
      </div>
    </div>
  );
}
