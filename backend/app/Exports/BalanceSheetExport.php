<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class BalanceSheetExport implements FromCollection, WithHeadings, WithStyles, WithTitle
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        $rows = [];

        // Header
        $rows[] = ['BALANCE SHEET'];
        $rows[] = ['As of Date', $this->data['as_of_date']];
        $rows[] = [];

        // Summary
        $rows[] = ['SUMMARY'];
        $rows[] = ['Total Assets', number_format($this->data['summary']['total_assets'], 2)];
        $rows[] = ['Total Liabilities', number_format($this->data['summary']['total_liabilities'], 2)];
        $rows[] = ['Total Equity', number_format($this->data['summary']['total_equity'], 2)];
        $rows[] = ['Total Liabilities & Equity', number_format($this->data['summary']['total_liabilities_equity'], 2)];
        $rows[] = ['Balanced', $this->data['summary']['total_liabilities_equity'] == $this->data['summary']['total_assets'] ? 'Yes' : 'No'];
        $rows[] = [];

        // Assets
        $rows[] = ['ASSETS'];
        $rows[] = ['Account Number', 'Account Name', 'Balance'];
        foreach ($this->data['assets'] as $asset) {
            $rows[] = [
                $asset['account_number'],
                $asset['account_name'],
                number_format($asset['balance'], 2),
            ];
        }
        $rows[] = ['Total Assets', '', number_format($this->data['summary']['total_assets'], 2)];
        $rows[] = [];

        // Liabilities
        $rows[] = ['LIABILITIES'];
        $rows[] = ['Account Number', 'Account Name', 'Balance'];
        foreach ($this->data['liabilities'] as $liability) {
            $rows[] = [
                $liability['account_number'],
                $liability['account_name'],
                number_format($liability['balance'], 2),
            ];
        }
        $rows[] = ['Total Liabilities', '', number_format($this->data['summary']['total_liabilities'], 2)];
        $rows[] = [];

        // Equity
        $rows[] = ['EQUITY'];
        $rows[] = ['Account Number', 'Account Name', 'Balance'];
        foreach ($this->data['equity'] as $equity) {
            $rows[] = [
                $equity['account_number'],
                $equity['account_name'],
                number_format($equity['balance'], 2),
            ];
        }
        $rows[] = ['Total Equity', '', number_format($this->data['summary']['total_equity'], 2)];
        $rows[] = [];
        $rows[] = ['TOTAL LIABILITIES & EQUITY', '', number_format($this->data['summary']['total_liabilities_equity'], 2)];

        return collect($rows);
    }

    public function headings(): array
    {
        return [];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            4 => ['font' => ['bold' => true]],
            10 => ['font' => ['bold' => true]],
            11 => ['font' => ['bold' => true]],
            17 => ['font' => ['bold' => true]],
            18 => ['font' => ['bold' => true]],
            24 => ['font' => ['bold' => true]],
            25 => ['font' => ['bold' => true]],
            31 => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        return 'Balance Sheet';
    }
}
