<?php

namespace App\Actions\Course;

class ExtractYoutubeVideoId
{
    /**
     * Extract the 11-character video ID from a YouTube URL.
     *
     * Handles youtube.com/watch?v=, youtu.be/, and youtube.com/embed/ formats,
     * ignoring any extra query params (timestamps, playlists, etc).
     */
    public function handle(string $url): ?string
    {
        $pattern = '#(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([A-Za-z0-9_-]{11})#i';

        if (preg_match($pattern, $url, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
