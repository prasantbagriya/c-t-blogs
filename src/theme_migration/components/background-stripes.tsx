// Lightweight replacement — no framer-motion, no animated paths
// Original had 48 motion.path elements × 4 instances = 192 simultaneous SVG animations

export default function BackgroundStripes() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Static diagonal stripe lines — pure CSS, no JS */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035]"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <path d="M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875" stroke="#94a3b8" strokeWidth="1.2" />
        <path d="M-310 -140C-310 -140 -242 265 222 392C686 519 754 924 754 924" stroke="#94a3b8" strokeWidth="0.9" />
        <path d="M-450 -240C-450 -240 -382 165  82 292C546 419 614 824 614 824" stroke="#94a3b8" strokeWidth="0.7" />
        <path d="M-240 -95C-240 -95 -172 310 292 437C756 564 824 969 824 969" stroke="#94a3b8" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
