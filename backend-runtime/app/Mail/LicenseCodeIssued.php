<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\License;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class LicenseCodeIssued extends Mailable
{
    use Queueable;

    public function __construct(
        public Company $company,
        public License $license,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your EMTS License Activation Code',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.license-code-issued',
            with: [
                'company' => $this->company,
                'license' => $this->license,
            ],
        );
    }
}
