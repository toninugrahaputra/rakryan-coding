<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class ArticleAiGeneratorService
{
    protected ?string $apiKey;

    protected string $model;

    public function __construct()
    {
        $this->apiKey = config('services.openrouter.api_key');
        $this->model = config('services.openrouter.model', 'nvidia/nemotron-3-ultra-550b-a55b:free');
    }

    /**
     * Generate EditorJS-format article content from a title via OpenRouter's
     * chat completions API.
     *
     * @return array{excerpt: ?string, blocks: array<int, array<string, mixed>>}
     */
    public function generateArticle(string $title): array
    {
        if (empty($this->apiKey)) {
            throw new RuntimeException('OPENROUTER_API_KEY belum dikonfigurasi di server.');
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.$this->apiKey,
            'Content-Type' => 'application/json',
        ])
            ->timeout(240)
            ->post('https://openrouter.ai/api/v1/chat/completions', [
                'model' => $this->model,
                'max_tokens' => 8000,
                'messages' => [
                    ['role' => 'user', 'content' => $this->buildPrompt($title)],
                ],
            ]);

        if (! $response->successful()) {
            Log::error('OpenRouter article generation failed: '.$response->body());

            throw new RuntimeException('Gagal generate artikel dengan AI (status '.$response->status().').');
        }

        $text = $response->json('choices.0.message.content', '');

        return $this->parseResponse(is_string($text) ? $text : '');
    }

    private function buildPrompt(string $title): string
    {
        return <<<PROMPT
            Kamu adalah penulis konten teknis untuk platform belajar coding berbahasa Indonesia bernama Rakryan Coding.

            Tulis artikel LENGKAP dan MENDALAM dengan judul: "{$title}"

            Aturan panjang & kedalaman (WAJIB dipatuhi, jangan menulis artikel pendek):
            - Kalau judul menyebutkan jumlah poin tertentu (misalnya "10 praktik", "7 langkah", "5 kesalahan"), artikel WAJIB membahas SEMUA poin tersebut satu per satu sampai selesai — dilarang berhenti di tengah atau cuma bahas sebagian poin.
            - Setiap poin/section utama dijelaskan minimal 2-3 paragraf yang menjelaskan alasan (kenapa penting) dan cara penerapannya, ditambah minimal satu list berisi contoh konkret atau langkah praktis — jangan cuma satu paragraf singkat per poin.
            - Panjang total artikel minimal setara 1000-1500 kata.
            - Susunan wajib: 1 heading pembuka + isi (heading per poin, masing-masing diikuti beberapa paragraph dan list), lalu 1 section penutup/kesimpulan di akhir.
            - Karena poin di atas, artikel dengan banyak poin akan menghasilkan cukup banyak blocks — jangan dipangkas demi mempersingkat, tulis semuanya sampai tuntas.

            Kembalikan HANYA JSON valid (tanpa markdown code fence, tanpa teks pembuka/penutup) dengan struktur PERSIS seperti ini:
            {"excerpt": "ringkasan 1-2 kalimat", "blocks": [ {"type": "header", "data": {"text": "...", "level": 2}}, {"type": "paragraph", "data": {"text": "..."}}, {"type": "list", "data": {"style": "unordered", "meta": {}, "items": [{"content": "...", "meta": {}, "items": []}]}}, {"type": "quote", "data": {"text": "...", "caption": "", "alignment": "left"}} ]}

            Aturan struktur:
            - Hanya gunakan block type: header (level 2-4), paragraph, list (style "ordered" atau "unordered"), quote. Jangan pakai tipe lain (tanpa image, table, code).
            - Setiap item pada list punya field "content", "meta": {}, "items": [].
            - Text pada paragraph/header/quote boleh memuat tag inline HTML sederhana: <b>, <i>, <a href="...">.
            - Isi harus benar-benar relevan dan spesifik dengan judul, jangan generik atau template kosong.
            - Bahasa Indonesia yang natural dan enak dibaca, hindari bahasa translasi mesin yang kaku.
            - Jangan tulis penjelasan, catatan, atau teks apapun di luar objek JSON tersebut.
            PROMPT;
    }

    /**
     * @return array{excerpt: ?string, blocks: array<int, array<string, mixed>>}
     */
    private function parseResponse(string $text): array
    {
        $text = trim($text);
        $text = preg_replace('/^```(?:json)?/i', '', $text) ?? $text;
        $text = preg_replace('/```$/', '', trim($text)) ?? $text;

        $decoded = json_decode(trim($text), true);

        if (json_last_error() !== JSON_ERROR_NONE || ! is_array($decoded) || ! isset($decoded['blocks']) || ! is_array($decoded['blocks'])) {
            Log::error('OpenRouter article generation returned unparseable content: '.$text);

            throw new RuntimeException('Respons AI tidak dapat diproses. Coba generate ulang.');
        }

        return [
            'excerpt' => is_string($decoded['excerpt'] ?? null) ? $decoded['excerpt'] : null,
            'blocks' => $decoded['blocks'],
        ];
    }
}
