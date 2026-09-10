<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\HtmlString;

class VerifyEmailWithCode extends Notification
{
    public function __construct(public readonly string $code) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Kode verifikasi email Rakryan Coding')
            ->greeting('Halo!')
            ->line('Gunakan kode berikut untuk verifikasi email kamu di Rakryan Coding:')
            ->line(new HtmlString("<div style=\"font-size:28px;font-weight:700;letter-spacing:0.3em;text-align:center;margin:16px 0;\">{$this->code}</div>"))
            ->line('Kode ini berlaku selama 10 menit.')
            ->line('Kalau kamu tidak merasa mendaftar di Rakryan Coding, abaikan saja email ini.');
    }
}
