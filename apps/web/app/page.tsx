import { Button } from "@repo/ui/button";

export default function Home() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Welcome to Orai</h1>
      <p>The Open-Source, Privacy-First Email Client</p>
      <a href="http://localhost:3001/auth/google">
        <Button>Connect with Gmail</Button>
      </a>
    </div>
  );
}
