# Prompt Pattern Library

Katalog pola prompting yang dioptimalkan untuk agen CodeBOT. Pilih pola dengan biaya token terendah yang masih menjamin akurasi.

## 1. Zero-Shot Direct
**Deskripsi**: Instruksi langsung tanpa contoh. 
**Kapan digunakan**: Tugas sederhana, output terdefinisi dengan baik.
**Struktur**: `{Imperative instruction}. {Constraints}.`
**Biaya Token**: ⭐ (Terendah)
**Contoh**: 
> Create a TypeScript utility function `formatCurrency(amount: number, currency: string): string` using Intl.NumberFormat. Handle invalid inputs by returning "—".

## 2. Structured Output
**Deskripsi**: Memaksa output mengikuti skema tertentu (JSON, XML, Markdown Table).
**Kapan digunakan**: Output harus bisa diparsing oleh mesin atau agen lain.
**Struktur**: `{Task}. Output format: {JSON schema | XML tags | TS interface}.`
**Biaya Token**: ⭐⭐
**Contoh**:
> Analyze the endpoint. Output strictly in JSON:
> ```json
> {"endpoint": "string", "method": "GET|POST", "params": [{"name": "string", "type": "string"}]}
> ```

## 3. Chain-of-Thought (CoT)
**Deskripsi**: Meminta model untuk berpikir langkah demi langkah sebelum memberikan jawaban akhir.
**Kapan digunakan**: Tugas yang membutuhkan penalaran logis, debugging, atau analisis trade-off.
**Struktur**: `{Task}. Think step-by-step: 1) {step}, 2) {step}. Then produce {output}.`
**Biaya Token**: ⭐⭐⭐
**Contoh**:
> Optimize the SQL query. Think step-by-step: 1) Identify full-table scans, 2) Check index usage, 3) Propose rewrites. Then output the optimized query.

## 4. Persona Framing
**Deskripsi**: Memberikan identitas spesifik kepada model untuk mengunci gaya bahasa, kosakata, dan tingkat keahlian.
**Kapan digunakan**: Saat *tone* atau perspektif sangat mempengaruhi kualitas output.
**Struktur**: `Act as {specific_persona}. {Task}. {Constraints}.`
**Biaya Token**: ⭐⭐
**Contoh**:
> Act as a WCAG 2.1 AA auditor. Review the form component. List each violation with: element, rule ID, severity, and fix.

## 5. Few-Shot
**Deskripsi**: Memberikan 2-5 contoh (input → output) untuk dipelajari polanya oleh model.
**Kapan digunakan**: Format output sangat spesifik dan sulit dijelaskan dengan kata-kata.
**Biaya Token**: ⭐⭐⭐⭐ (Tinggi)
**Contoh**:
> Convert the following test cases to Gherkin syntax. Follow these examples:
> Input: `test_login()` → Output: `Given user is on login page When user enters valid credentials Then they see the dashboard`

## 6. Decomposed CoT + Structured
**Deskripsi**: Memecah tugas kompleks menjadi fase-fase terpisah, di mana setiap fase memiliki output terstruktur.
**Kapan digunakan**: Tugas multi-fase (misal: arsitektur -> implementasi -> testing).
**Biaya Token**: ⭐⭐⭐⭐⭐ (Tertinggi)
**Contoh**:
> Refactor the auth module. Phases:
> 1. Analysis: Output JSON of dependencies.
> 2. Implementation: Output Unified Diff.
> 3. Testing: Output list of test cases.

## Matriks Pemilihan Pola
| Karakteristik Tugas | Pola yang Direkomendasikan |
| :--- | :--- |
| Output format kaku (JSON/XML) | Structured Output |
| Membutuhkan penalaran/logika | Chain-of-Thought (CoT) |
| Gaya bahasa / Persona penting | Persona Framing |
| Pola format sangat rumit | Few-Shot (maks 5) |
| Tugas multi-fase / kompleks | Decomposed CoT + Structured |
| Tugas sederhana / rutin | Zero-Shot Direct |