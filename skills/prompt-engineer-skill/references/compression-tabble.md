# Compression & Translation Tables

Aturan ketat untuk memangkas token tanpa menghilangkan makna (semantic fidelity).

## 1. Substitusi Verbal (Verbose → Compressed)
| Kalimat Asli | Bentuk Kompresi |
| :--- | :--- |
| in order to | to |
| due to the fact that | because |
| at this point in time | now |
| in the event that | if |
| prior to | before |
| subsequent to | after |
| has the ability to | can |
| make a decision | decide |
| provide an explanation of | explain |
| take into consideration | consider |
| it is possible that | may |
| it is necessary that | must |
| in the majority of cases | usually |

## 2. Substitusi Struktural (Prosa → Simbol/Notasi)
| Prosa | Notasi Terstruktur |
| :--- | :--- |
| "The function accepts X and returns Y" | `(X) → Y` |
| "If A then B else C" | `A ? B : C` |
| "Must be at least 8 characters" | `≥8 chars` |
| "Less than or equal to 100" | `≤100` |
| "Not equal to null" | `≠null` |
| "And" | `&` |
| "Or" | `\|` |
| "Leads to" | `→` |
| "For example" | `e.g.` |
| "That is" | `i.e.` |

## 3. Translasi Temuan Data Analyst → Batasan Eksekusi (Data → Constraint)
Jangan pernah menyalin kata-kata Data Analyst secara verbatim. Ubah menjadi *actionable constraints*.

| Temuan Data Analyst | Batasan untuk Agen Eksekutor |
| :--- | :--- |
| "Revenue dropped 12% in Q4" | Highlight Q4 revenue decline with red indicator |
| "Users abandon at password field (43%)" | Password field must show helper text + strength meter |
| "Mobile traffic is 78%" | Mobile-first layout; test at 375px viewport |
| "API latency spikes at 2s under load" | Add loading skeleton; timeout handling at 2s |
| "Conversion drops 30% on step 3" | Step 3 requires simplified UX; A/B test flagged |
| "11 required fields cause drop-off" | Reduce required fields to ≤5 (or defer) |
| "Retention 3x higher when onboarding completes" | Ensure completion path is frictionless |

## 4. Aturan Referensi (@reference)
Jangan pernah menulis ulang konten besar di dalam prompt. Gunakan referensi.

| Daripada Menulis... | Gunakan... |
| :--- | :--- |
| Seluruh daftar design token | `@design-system/v2 tokens` |
| Skema API lengkap | `@api-schema.json` |
| Spesifikasi komponen penuh | `@specs/component-{id}.md` |
| Daftar error standar | `@errors/standard.json` |