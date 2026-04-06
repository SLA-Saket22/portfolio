// pages/Home.jsx
import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const skeletonStyle = {
  background: "linear-gradient(90deg, rgba(255,255,255,.04) 25%, rgba(255,255,255,.08) 50%, rgba(255,255,255,.04) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
  borderRadius: 8,
};

const shimmerKeyframes = `
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .project-card {
    animation: fadeUp 0.4s ease both;
  }
  .project-card:nth-child(1) { animation-delay: 0.05s; }
  .project-card:nth-child(2) { animation-delay: 0.12s; }
  .project-card:nth-child(3) { animation-delay: 0.19s; }
  .project-card:nth-child(4) { animation-delay: 0.26s; }
  .project-card:nth-child(5) { animation-delay: 0.33s; }
  .project-card:nth-child(6) { animation-delay: 0.40s; }
`;

function SkeletonCard() {
  return (
    <div style={{
      background: "rgba(255,255,255,.03)",
      border: "1px solid rgba(255,255,255,.08)",
      borderRadius: 20,
      overflow: "hidden",
    }}>
      <div style={{ height: 200, ...skeletonStyle, borderRadius: 0 }} />
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ ...skeletonStyle, height: 10, width: "40%", borderRadius: 4 }} />
        <div style={{ ...skeletonStyle, height: 16, width: "70%", borderRadius: 4 }} />
        <div style={{ ...skeletonStyle, height: 12, width: "90%", borderRadius: 4 }} />
        <div style={{ ...skeletonStyle, height: 12, width: "60%", borderRadius: 4 }} />
        <div style={{ ...skeletonStyle, height: 32, width: 110, marginTop: 8, borderRadius: 6 }} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      gridColumn: "1 / -1",
      textAlign: "center",
      padding: "80px 20px",
      color: "#2d3748",
    }}>
      <div style={{ fontSize: "3rem", marginBottom: 16, opacity: 0.4 }}>◻</div>
      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.75rem", letterSpacing: "2px", color: "#4a5568" }}>
        // No projects found
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      gridColumn: "1 / -1",
      textAlign: "center",
      padding: "60px 20px",
    }}>
      <div style={{
        display: "inline-block",
        background: "rgba(255,59,48,.07)",
        border: "1px solid rgba(255,59,48,.2)",
        borderRadius: 12,
        padding: "32px 40px",
        maxWidth: 400,
      }}>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "0.7rem", color: "#ff6b6b", letterSpacing: "1px", marginBottom: 16 }}>
          ⚠ {message || "Failed to load projects"}
        </p>
        <button
          onClick={onRetry}
          style={{
            background: "transparent",
            border: "1px solid rgba(57,255,20,.3)",
            color: "#39ff14",
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "0.65rem",
            letterSpacing: "2px",
            padding: "9px 20px",
            borderRadius: 6,
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Retry →
        </button>
      </div>
    </div>
  );
}

function ProjectCard({ project, index }) {
  const { title, sub, description, url, tag, glyph, techStack, liveUrl, githubUrl } = project;
  const link = liveUrl || url || githubUrl || "#";
  const displaySub = sub || description || "";
  const displayTag = Array.isArray(tag) ? tag[0] : tag;
  const displayGlyph = glyph || "⬡";

  return (
    <div
      className="project-card"
      style={{
        background: "rgba(255,255,255,.03)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 20,
        overflow: "hidden",
        transition: "border-color .25s, transform .25s, box-shadow .25s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(57,255,20,.35)";
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 16px 48px rgba(57,255,20,.07)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Preview */}
      <div style={{
        height: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,rgba(124,58,237,.14),rgba(57,255,20,.07))",
        fontSize: "5rem",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* 🔥 Background Image */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `url(${project.image})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      opacity: 0.4, // 👈 control visibility
    }}
  />

  {/* Grid Overlay */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(57,255,20,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(57,255,20,.04) 1px,transparent 1px)",
      backgroundSize: "24px 24px",
    }}
  />

        {/* Index badge */}
        <div style={{
          position: "absolute",
          top: 14,
          right: 14,
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: "0.58rem",
          color: "rgba(57,255,20,.5)",
          letterSpacing: "2px",
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        <span style={{ position: "relative", zIndex: 2 }}>{displayGlyph}</span>
      </div>

      {/* Body */}
      <div style={{ padding: 24 }}>
        {displayTag && (
          <div style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: "0.6rem",
            color: "#39ff14",
            letterSpacing: "3px",
            marginBottom: 8,
            textTransform: "uppercase",
          }}>
            {displayTag}
          </div>
        )}

        <h3 style={{
          fontFamily: "'Syne',sans-serif",
          fontWeight: 700,
          fontSize: "1.15rem",
          color: "#f8fafc",
          marginBottom: 6,
        }}>
          {title}
        </h3>

        <p style={{
          fontSize: "0.82rem",
          color: "#475569",
          marginBottom: 16,
          lineHeight: 1.6,
        }}>
          {displaySub}
        </p>

        {/* Tech stack pills */}
        {Array.isArray(techStack) && techStack.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
            {techStack.slice(0, 4).map((tech) => (
              <span key={tech} style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "0.55rem",
                letterSpacing: "1px",
                color: "#4a5568",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 4,
                padding: "3px 8px",
                textTransform: "uppercase",
              }}>
                {tech}
              </span>
            ))}
            {techStack.length > 4 && (
              <span style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "0.55rem",
                color: "#2d3748",
                padding: "3px 4px",
              }}>
                +{techStack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Links */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {link !== "#" && (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "0.66rem",
                letterSpacing: "1.5px",
                color: "#39ff14",
                textDecoration: "none",
                textTransform: "uppercase",
                border: "1px solid rgba(57,255,20,.3)",
                padding: "8px 18px",
                borderRadius: 6,
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(57,255,20,.1)";
                e.currentTarget.style.boxShadow = "0 0 16px rgba(57,255,20,.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Visit Site <i className="fas fa-arrow-right" style={{ fontSize: "0.65rem" }} />
            </a>
          )}

          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "0.66rem",
                letterSpacing: "1.5px",
                color: "#4a5568",
                textDecoration: "none",
                textTransform: "uppercase",
                border: "1px solid rgba(255,255,255,.08)",
                padding: "8px 18px",
                borderRadius: 6,
                transition: "all .2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#f8fafc";
                e.currentTarget.style.borderColor = "rgba(255,255,255,.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#4a5568";
                e.currentTarget.style.borderColor = "rgba(255,255,255,.08)";
              }}
            >
              <i className="fab fa-github" style={{ fontSize: "0.85rem" }} /> Code
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Project({ Divider, SectionTitle, SectionLabel }) {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  const fetchProjects = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/projects`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setProjects(data);
      setStatus("success");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <>
      <style>{shimmerKeyframes}</style>
      <section
        id="work"
        style={{
          padding: "100px 5vw",
          background: "#0d0d1f",
          borderTop: "1px solid rgba(255,255,255,.04)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionLabel>// 03. portfolio</SectionLabel>
          <SectionTitle>My Works</SectionTitle>

          {/* Live count badge */}
          {status === "success" && projects.length > 0 && (
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: "0.6rem",
              color: "#4a5568",
              letterSpacing: "2px",
              marginBottom: 8,
            }}>
              <span style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#39ff14",
                boxShadow: "0 0 6px #39ff14",
              }} />
              {projects.length} project{projects.length !== 1 ? "s" : ""} loaded
            </div>
          )}

          <Divider />

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
            gap: 24,
          }}>
            {status === "loading" && (
              Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            )}

            {status === "error" && (
              <ErrorState message={errorMsg} onRetry={fetchProjects} />
            )}

            {status === "success" && projects.length === 0 && <EmptyState />}

            {status === "success" && projects.map((project, i) => (
              <ProjectCard key={project._id || project.title} project={project} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Project;
