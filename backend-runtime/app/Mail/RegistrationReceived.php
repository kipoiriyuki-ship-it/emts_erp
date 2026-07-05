<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class RegistrationReceived extends Mailable
{
    use Queueable;

    public function __construct(
        public Company $company,
        public User $user,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New EMTS Registration Received',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.registration-received',
            with: [
                'company' => $this->company,
                'user' => $this->user,
            ],
        );
    }
}
