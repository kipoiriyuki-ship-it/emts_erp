<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>EMTS License Activation Code</title>
</head>
<body>
    <h1>Your EMTS License Activation Code</h1>

    <p>Dear {{ $company->pic ?? $company->name }},</p>

    <p>Your EMTS license activation code has been generated. Please use the code below to activate your account:</p>

    <p><strong>{{ $license->license_code }}</strong></p>

    <h2>License Details</h2>
    <ul>
        <li><strong>Type:</strong> {{ $license->license_type }}</li>
        <li><strong>Valid From:</strong> {{ $license->valid_from?->toDateString() }}</li>
        <li><strong>Valid Until:</strong> {{ $license->valid_until?->toDateString() ?? 'No expiry' }}</li>
    </ul>

    <p>Visit the EMTS activation page and enter the code to complete your account activation.</p>

    <p>Activation page: <a href="{{ config('app.url') }}/license/activate">{{ config('app.url') }}/license/activate</a></p>
</body>
</html>
