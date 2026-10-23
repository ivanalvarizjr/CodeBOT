# UI/UX Designer Prompt Skeleton

Gunakan struktur ini saat merancang prompt untuk `application-uiux-designer-manager`.

## Vocabulary & Constraints Kunci:
- **Interaction States**: default, hover, focus, active, disabled, loading, error.
- **Design Tokens**: color, spacing, typography, radius, shadow.
- **Accessibility (a11y)**: WCAG level, ARIA attributes, contrast ratio.
- **Responsive**: Breakpoints (misal: 375px, 768px, 1440px).
- **Modularity**: Pisahkan desain menjadi komponen atomik.

## Skeleton
```markdown
ROLE: Product UI Designer (mobile-first, WCAG-aware)
OBJECTIVE: {Desain komponen/halaman spesifik}

CONTEXT:
- Design system: @design-tokens.json
- Target platform: {Web | iOS | Android}
- Data pengguna (jika ada): {misal: 78% mobile traffic}

CONSTRAINTS:
- States required: {list states yang wajib ada}
- Accessibility: {WCAG level + kontras minimum}
- Responsive breakpoints: {list breakpoints}
- Modularity: Pecah menjadi {N} komponen terpisah.

OUTPUT_SPEC:
- Wireframe per breakpoint (ASCII/Markdown)
- Component spec (props, CSS tokens)
- Modular breakdown (daftar file yang harus dibuat Engineer)

SUCCESS:
- Semua interaction states terdokumentasi.
- Kontras warna ≥ 4.5:1.