import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "./theme";

const STAGGER = 18;

// Eased 0→1 progress, so items enter one at a time and never move linearly.
const useReveal = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return interpolate(frame - delay, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
};

const Reveal: React.FC<{ delay?: number; children: React.ReactNode }> = ({
  delay = 0,
  children,
}) => {
  const p = useReveal(delay);
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 24}px)` }}>
      {children}
    </div>
  );
};

const FullScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      backgroundColor: theme.background,
      color: theme.text,
      fontFamily: theme.font,
      padding: 120,
      justifyContent: "center",
    }}
  >
    {children}
  </AbsoluteFill>
);

const Heading: React.FC<{ text: string }> = ({ text }) => (
  <Reveal>
    <div style={{ fontSize: 72, fontWeight: 800, marginBottom: 56 }}>{text}</div>
  </Reveal>
);

export const Title: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => (
  <FullScreen>
    <Reveal>
      <div style={{ fontSize: 120, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
    </Reveal>
    {subtitle ? (
      <Reveal delay={STAGGER}>
        <div style={{ fontSize: 48, color: theme.muted, marginTop: 32 }}>{subtitle}</div>
      </Reveal>
    ) : null}
  </FullScreen>
);

// Transparent: renders over the footage.
export const LowerThird: React.FC<{ name: string; role?: string }> = ({ name, role }) => {
  const p = useReveal();
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", padding: 80, fontFamily: theme.font }}>
      <div
        style={{
          alignSelf: "flex-start",
          backgroundColor: theme.surface,
          borderLeft: `10px solid ${theme.accent}`,
          color: theme.text,
          padding: "24px 40px",
          opacity: p,
          transform: `translateX(${(1 - p) * -60}px)`,
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 700 }}>{name}</div>
        {role ? <div style={{ fontSize: 30, color: theme.muted }}>{role}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

// Transparent: a large spoken phrase, with the key word in the accent colour.
export const Highlight: React.FC<{ text: string; word: string }> = ({ text, word }) => {
  const p = useReveal();
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: 120,
        fontFamily: theme.font,
        fontSize: 96,
        fontWeight: 800,
        color: theme.text,
        opacity: p,
        textShadow: "0 4px 24px rgba(0,0,0,0.8)",
      }}
    >
      <div>
        {text.split(" ").map((w, i) => (
          <span key={i} style={{ color: w === word ? theme.accent : undefined }}>
            {w}{" "}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const List: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <FullScreen>
    <Heading text={title} />
    {items.map((item, i) => (
      <Reveal key={item} delay={STAGGER * (i + 1)}>
        <div style={{ fontSize: 52, marginBottom: 28 }}>
          <span style={{ color: theme.accent, fontWeight: 800 }}>{i + 1}.</span> {item}
        </div>
      </Reveal>
    ))}
  </FullScreen>
);

export const Comparison: React.FC<{
  title: string;
  left: { label: string; items: string[] };
  right: { label: string; items: string[] };
}> = ({ title, left, right }) => (
  <FullScreen>
    <Heading text={title} />
    <div style={{ display: "flex", gap: 48 }}>
      {[left, right].map((side, s) => (
        <div
          key={side.label}
          style={{ flex: 1, backgroundColor: theme.surface, padding: 48, borderRadius: 16 }}
        >
          <Reveal delay={STAGGER * (s * 3 + 1)}>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                marginBottom: 24,
                color: s === 1 ? theme.accent : theme.text,
              }}
            >
              {side.label}
            </div>
          </Reveal>
          {side.items.map((item, i) => (
            <Reveal key={item} delay={STAGGER * (s * 3 + 2) + i * 8}>
              <div style={{ fontSize: 38, marginBottom: 16 }}>{item}</div>
            </Reveal>
          ))}
        </div>
      ))}
    </div>
  </FullScreen>
);

export const Diagram: React.FC<{ title: string; steps: string[]; stagger?: number }> = ({
  title,
  steps,
  stagger = STAGGER,
}) => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  return (
    <FullScreen>
      <Heading text={title} />
      <div
        style={{
          display: "flex",
          flexDirection: vertical ? "column" : "row",
          alignItems: vertical ? "stretch" : "center",
          gap: 24,
        }}
      >
        {steps.map((step, i) => (
          <React.Fragment key={step}>
            {i > 0 ? (
              <Reveal delay={stagger * (i + 1) - Math.min(8, stagger)}>
                <div style={{ fontSize: 56, color: theme.accent, textAlign: "center" }}>
                  {vertical ? "↓" : "→"}
                </div>
              </Reveal>
            ) : null}
            <div style={{ flex: vertical ? undefined : 1 }}>
              <Reveal delay={stagger * (i + 1)}>
                <div
                  style={{
                    backgroundColor: theme.surface,
                    borderRadius: 16,
                    padding: "48px 24px",
                    textAlign: "center",
                    fontSize: vertical ? 64 : 40,
                    fontWeight: 700,
                  }}
                >
                  {step}
                </div>
              </Reveal>
            </div>
          </React.Fragment>
        ))}
      </div>
    </FullScreen>
  );
};

export const BarChart: React.FC<{
  title: string;
  unit?: string;
  data: { label: string; value: number }[];
}> = ({ title, unit = "", data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const max = Math.max(...data.map((d) => d.value));
  return (
    <FullScreen>
      <Heading text={title} />
      {data.map((d, i) => {
        const p = interpolate(frame - STAGGER * (i + 1), [0, fps * 0.8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        return (
          <div key={d.label} style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
            <div style={{ width: 320, fontSize: 40 }}>{d.label}</div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  width: `${(d.value / max) * p * 85}%`,
                  height: 64,
                  backgroundColor: theme.accent,
                  borderRadius: 8,
                }}
              />
            </div>
            <div style={{ width: 200, fontSize: 40, fontWeight: 700, textAlign: "right" }}>
              {Math.round(d.value * p)}
              {unit}
            </div>
          </div>
        );
      })}
    </FullScreen>
  );
};

// A mock window that "types" a command and then shows its output lines.
export const FakeUI: React.FC<{ windowTitle: string; command: string; output: string[] }> = ({
  windowTitle,
  command,
  output,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typed = Math.floor(
    interpolate(frame, [fps * 0.3, fps * 1.5], [0, command.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  return (
    <FullScreen>
      <div style={{ backgroundColor: theme.surface, borderRadius: 20, overflow: "hidden" }}>
        <div style={{ padding: "20px 32px", fontSize: 28, color: theme.muted }}>{windowTitle}</div>
        <div style={{ padding: 40, fontSize: 40, fontFamily: "Menlo, monospace", minHeight: 480 }}>
          <div>
            <span style={{ color: theme.accent }}>$ </span>
            {command.slice(0, typed)}
          </div>
          {output.map((line, i) => (
            <Reveal key={line} delay={fps * 1.7 + i * STAGGER}>
              <div style={{ marginTop: 20, color: theme.muted }}>{line}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </FullScreen>
  );
};

export const EndScreen: React.FC<{ title: string; cta: string }> = ({ title, cta }) => (
  <FullScreen>
    <Reveal>
      <div style={{ fontSize: 96, fontWeight: 800, textAlign: "center" }}>{title}</div>
    </Reveal>
    <Reveal delay={STAGGER}>
      <div style={{ fontSize: 48, color: theme.accent, marginTop: 32, textAlign: "center" }}>{cta}</div>
    </Reveal>
  </FullScreen>
);
