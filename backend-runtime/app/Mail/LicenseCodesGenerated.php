<?php

namespace App\Mail;

use App\Models\Company;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Collection;

class LicenseCodesGenerated extends Mailable
{
    public function __construct(
        public Company $company,
        public User $user,
        public Collection $licenses,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'EMTS License Codes Generated for ' . $this->company->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.license-codes-generated',
            with: [
                'company' => $this->company,
                'user' => $this->user,
                'licenses' => $this->licenses,
            ],
        );
    }
}
