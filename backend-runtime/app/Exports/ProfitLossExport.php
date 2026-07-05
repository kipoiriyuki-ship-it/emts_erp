<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ProfitLossExport implements FromCollection, WithHeadings, WithStyles, WithTitle
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        $rows = [];

        // Summary
        $rows[] = ['PROFIT AND LOSS STATEMENT'];
        $rows[] = ['Period', $this->data['period']['start_date'], 'to', $this->data['period']['end_date']];
        $rows[] = [];
        $rows[] = ['SUMMARY'];
        $rows[] = ['Total Revenue', number_format($this->data['summary']['total_revenue'], 2)];
        $rows[] = ['Total Expenses', number_format($this->data['summary']['total_expenses'], 2)];
        $rows[] = ['Net Profit', number_format($this->data['summary']['net_profit'], 2)];
        $rows[] = ['Profit Margin', number_format($this->data['summary']['profit_margin'], 2) . '%'];
        $rows[] = [];

        // Revenue
        $rows[] = ['REVENUE'];
        $rows[] = ['Account Number', 'Account Name', 'Amount'];
        foreach ($this->data['revenue'] as $revenue) {
            foreach ($revenue->items as $item) {
                $rows[] = [
                    $item->account->account_number,
                    $item->account->account_name,
                    $item->credit,
                ];
            }
        }
        $rows[] = ['Total Revenue', '', $this->data['summary']['total_revenue']];
        $rows[] = [];

        // Expenses
        $rows[] = ['EXPENSES'];
        $rows[] = ['Account Number', 'Account Name', 'Amount'];
        foreach ($this->data['expenses'] as $expense) {
            foreach ($expense->items as $item) {
                $rows[] = [
                    $item->account->account_number,
                    $item->account->account_name,
                    $item->debit,
                ];
            }
        }
        $rows[] = ['Total Expenses', '', $this->data['summary']['total_expenses']];
        $rows[] = [];
        $rows[] = ['NET PROFIT', '', $this->data['summary']['net_profit']];

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
            11 => ['font' => ['bold' => true]],
            12 => ['font' => ['bold' => true]],
            18 => ['font' => ['bold' => true]],
            19 => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        return 'Profit & Loss';
    }
}
