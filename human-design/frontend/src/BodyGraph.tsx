import { useLocale } from "./locale";
import { useState } from "react";
import type { Result } from "./types";
const nodes = [
  {
    id: "head",
    name: "Baş",
    x: 180,
    y: 38,
    shape: "triangle",
    color: "#d8bc6e",
  },
  { id: "ajna", name: "Ajna", x: 180, y: 115, shape: "down", color: "#a3b7a5" },
  {
    id: "throat",
    name: "Boğaz",
    x: 180,
    y: 197,
    shape: "square",
    color: "#cdb297",
  },
  {
    id: "g",
    name: "G / Kimlik",
    x: 180,
    y: 290,
    shape: "diamond",
    color: "#dcc575",
  },
  {
    id: "heart",
    name: "Kalp / Ego",
    x: 260,
    y: 298,
    shape: "triangle",
    color: "#c28c81",
  },
  {
    id: "splenic",
    name: "Dalak",
    x: 74,
    y: 382,
    shape: "triangle",
    color: "#baa88d",
  },
  {
    id: "solar plexus",
    name: "Solar Pleksus",
    x: 286,
    y: 382,
    shape: "triangle",
    color: "#bca292",
  },
  {
    id: "sacral",
    name: "Sakral",
    x: 180,
    y: 395,
    shape: "square",
    color: "#c58e81",
  },
  {
    id: "root",
    name: "Kök",
    x: 180,
    y: 486,
    shape: "square",
    color: "#bcaa94",
  },
];
// Complete channel-to-center topology. Lines are schematic rather than a
// reproduction of a third party's copyrighted BodyGraph artwork.
const connections: [string, string, string][] = [
  ["64-47", "head", "ajna"],
  ["61-24", "head", "ajna"],
  ["63-4", "head", "ajna"],
  ["17-62", "ajna", "throat"],
  ["43-23", "ajna", "throat"],
  ["11-56", "ajna", "throat"],
  ["31-7", "throat", "g"],
  ["8-1", "throat", "g"],
  ["33-13", "throat", "g"],
  ["20-10", "throat", "g"],
  ["45-21", "throat", "heart"],
  ["12-22", "throat", "solar plexus"],
  ["35-36", "throat", "solar plexus"],
  ["16-48", "throat", "splenic"],
  ["20-57", "throat", "splenic"],
  ["20-34", "throat", "sacral"],
  ["10-57", "g", "splenic"],
  ["10-34", "g", "sacral"],
  ["15-5", "g", "sacral"],
  ["2-14", "g", "sacral"],
  ["46-29", "g", "sacral"],
  ["25-51", "g", "heart"],
  ["26-44", "heart", "splenic"],
  ["40-37", "heart", "solar plexus"],
  ["50-27", "splenic", "sacral"],
  ["57-34", "splenic", "sacral"],
  ["32-54", "splenic", "root"],
  ["28-38", "splenic", "root"],
  ["18-58", "splenic", "root"],
  ["59-6", "sacral", "solar plexus"],
  ["42-53", "sacral", "root"],
  ["3-60", "sacral", "root"],
  ["9-52", "sacral", "root"],
  ["49-19", "solar plexus", "root"],
  ["55-39", "solar plexus", "root"],
  ["30-41", "solar plexus", "root"],
];
const canonical = (v: string) =>
  v
    .split("-")
    .map(Number)
    .sort((a, b) => a - b)
    .join("-");
export default function BodyGraph({ result }: { result: Result }) {
  const { t } = useLocale();
  const [selected, setSelected] = useState("sacral");
  const node = nodes.find((n) => n.id === selected)!;
  return (
    <div className="graph-wrap">
      <svg
        viewBox="0 0 360 535"
        role="group"
        aria-label={t("Dokuz merkezli şematik Human Design haritası")}
      >
        <defs>
          <radialGradient id="halo">
            <stop stopColor="#eadfc8" stopOpacity=".4" />
            <stop offset="1" stopColor="#eadfc8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="180" cy="286" rx="175" ry="220" fill="url(#halo)" />
        {connections.map(([channel, a, b], i) => {
          const from = nodes.find((n) => n.id === a)!,
            to = nodes.find((n) => n.id === b)!;
          const active = result.channels.some(
            (c) => canonical(c) === canonical(channel),
          );
          const offset = ((i % 3) - 1) * 6;
          return (
            <path
              key={channel}
              d={`M ${from.x + offset} ${from.y} L ${to.x + offset} ${to.y}`}
              stroke={active ? "#896c43" : "#ddd8ce"}
              strokeWidth={active ? 4 : 2}
              fill="none"
            >
              <title>
                {t("Kanal")} {channel}
                {active ? t(" — tanımlı") : ""}
              </title>
            </path>
          );
        })}
        {nodes.map((n) => {
          const defined = result.centers.includes(n.id);
          const points =
            n.shape === "diamond"
              ? `${n.x},${n.y - 35} ${n.x + 35},${n.y} ${n.x},${n.y + 35} ${n.x - 35},${n.y}`
              : n.shape === "down"
                ? `${n.x - 32},${n.y - 24} ${n.x + 32},${n.y - 24} ${n.x},${n.y + 30}`
                : `${n.x},${n.y - 30} ${n.x + 34},${n.y + 24} ${n.x - 34},${n.y + 24}`;
          const props = {
            fill: defined ? n.color : "#fbfaf6",
            stroke: selected === n.id ? "#3d3427" : "#c3b9a8",
            strokeWidth: selected === n.id ? 2.5 : 1.3,
          };
          return (
            <g
              key={n.id}
              role="button"
              tabIndex={0}
              aria-label={`${t(n.name)}: ${defined ? t("tanımlı") : t("tanımsız")}`}
              aria-pressed={selected === n.id}
              onClick={() => setSelected(n.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(n.id);
                }
              }}
              className="graph-node"
            >
              {n.shape === "square" ? (
                <rect
                  x={n.x - 28}
                  y={n.y - 27}
                  width="56"
                  height="54"
                  rx="5"
                  {...props}
                />
              ) : (
                <polygon points={points} {...props} />
              )}
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                fontSize="9"
                fill="#433c31"
                fontWeight="600"
              >
                {t(n.name).split(" / ")[0]}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="center-note" role="status" aria-live="polite">
        <span className="status-dot" />
        <strong>{t(node.name)}</strong>
        <span>
          {result.centers.includes(selected)
            ? t("Tanımlı merkez")
            : t("Tanımsız merkez")}
        </span>
      </div>
    </div>
  );
}
