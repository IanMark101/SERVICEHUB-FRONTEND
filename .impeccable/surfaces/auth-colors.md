# Authentication color boundary

Mode: Operate. Refinement of the existing login/sign-up interface; preserve its layout, typography, charcoal primary buttons and authentication behavior.

User direction, 2026-10-12: landing and Help Center keep the lighter public orange; login and sign-up use the orange already used inside the system.

Public brand remains `#FF6B00`. Authentication uses the existing `--color-dashboard-action` (74% public orange with black, approximately `#BD4F00`), dashboard hover/active shades and readable dark-mode tints. The shared `.auth-shell` remaps brand/orange roles in `auth-responsive.css`, including the shared `--form-accent` used by field focus, carets and select menus. Body portal form accents are scoped by the presence of `.auth-shell`, so route navigation restores the public palette naturally.

Keep green success/two-role indicators, amber notices and red validation states semantic. Do not recolor Google branding, workspace role palettes or the public landing/Help Center. The in-login password recovery and registration-success views inherit the same auth ramp. The standalone reset-password route already uses the existing workspace palette.
