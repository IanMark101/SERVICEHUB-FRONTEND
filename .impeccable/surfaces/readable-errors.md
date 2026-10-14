# Plain-language upload and form errors

Mode: **Operate / clarify**. People verifying a local marketplace account may not know file formats or technical error terms. They need to understand which photo to choose and how to continue without losing their selection.

- Verification accepts JPG, PNG, and WebP photos up to 5 MB. Explain these requirements before choosing a photo. SVG, PDF, and other files stay blocked; server validation is unchanged.
- Keep file errors beside the affected picker, connect them to the control's accessible description, and announce them. Replace the mouse-only upload tile with a keyboard-accessible button.
- Keep a previously acceptable photo when a replacement is rejected, and explicitly say it is still selected. Keep selected photos after a submission failure so users can retry.
- Translate common network, timeout, permission, file and schema errors in the shared API message helper. Preserve useful business messages, specific waiting times and each endpoint's actual file limit. Use the caller's recovery message for runtime and server details.
- Profile photo selection uses the same supported formats, with its existing 10 MB limit. Replace canvas and file-reading terms with a clear next step.
- Simplify email and phone validation examples. Use the shared formatter in request/listing creation, sign-in, sign-up and password recovery rather than displaying raw server validation text. Keep the registered-email recovery path and form values intact.
- Preserve document privacy notices, acknowledgment meaning, permissions, API payloads and backend behavior.

Review invalid files, large photos, connection/server rejection, replacement and retry behavior with component tests; check the resulting copy at desktop and phone widths with illustrative local data. No identity documents or real submissions are used.
