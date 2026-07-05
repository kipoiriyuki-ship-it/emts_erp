<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>EMTS License Codes Generated</title>
</head>
<body>
    <h1>New EMTS Registration</h1>

    <p>A new company has registered and license codes have been generated.</p>

    <h2>Company Details</h2>
    <ul>
        <li><strong>Company:</strong> {{ $company->name }}</li>
        <li><strong>PIC:</strong> {{ $company->pic }}</li>
        <li><strong>Email:</strong> {{ $company->email }}</li>
        <li><strong>Phone:</strong> {{ $company->phone }}</li>
        <li><strong>Registration Date:</strong> {{ now()->toDateTimeString() }}</li>
    </ul>

    <h2>License Codes</h2>
    <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
            <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($licenses as $license)
                <tr>
                    <td>{{ $license->license_code }}</td>
                    <td>{{ $license->license_type }}</td>
                    <td>
                        @if ($license->license_type === 'TRIAL')
                            7 days
                        @elseif ($license->license_type === 'MONTHLY')
                            30 days
                        @elseif ($license->license_type === 'PREMIUM')
                            365 days
                        @else
                            Custom
                        @endif
                    </td>
                    <td>{{ ucfirst($license->status) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <p>Please share one of these codes manually with the customer for activation.</p>
</body>
</html>
