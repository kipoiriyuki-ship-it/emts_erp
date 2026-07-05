<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>New EMTS Registration Received</title>
</head>
<body>
    <h1>New EMTS Registration Received</h1>

    <p>A new company has registered and requires license activation.</p>

    <h2>Company Details</h2>
    <ul>
        <li><strong>Company:</strong> {{ $company->name }}</li>
        <li><strong>PIC:</strong> {{ $company->pic }}</li>
        <li><strong>Email:</strong> {{ $company->email }}</li>
        <li><strong>Phone:</strong> {{ $company->phone }}</li>
        <li><strong>Registration Date:</strong> {{ now()->toDateTimeString() }}</li>
    </ul>

    <p>Please generate a license activation code for this company and share it with the registered contact.</p>
</body>
</html>
