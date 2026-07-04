/** Recharts theme aligned with DESIGN.md brand palette */
export const CHART_COLORS = {
  primary: "#00ed64",
  primaryDeep: "#00684a",
  primarySoft: "#c3f0d2",
  teal: "#003d4f",
  tealDeep: "#001e2b",
  accentOrange: "#fa6e39",
  accentPurple: "#7b3ff2",
  accentPink: "#f06bb8",
  accentBlue: "#3d4f9f",
  muted: "#a8b3bc",
  grid: "#e1e5e8",
} as const;

export const CHART_SERIES = [
  CHART_COLORS.primary,
  CHART_COLORS.teal,
  CHART_COLORS.accentOrange,
  CHART_COLORS.accentPurple,
  CHART_COLORS.accentBlue,
];

export const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "#001e2b",
    border: "1px solid #1c2d38",
    borderRadius: "10px",
    fontSize: "12px",
    color: "#ffffff",
    boxShadow: "0 8px 24px rgba(0,30,43,0.18)",
  },
  itemStyle: { color: "#ffffff" },
  labelStyle: { color: "#a8b3bc", marginBottom: 4 },
};

export const chartAxisStyle = {
  tick: { fill: "#7c8c9a", fontSize: 11 },
  axisLine: { stroke: "#e1e5e8" },
};
