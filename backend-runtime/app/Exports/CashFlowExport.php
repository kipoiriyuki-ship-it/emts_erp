<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CashFlowExport implements FromCollection, WithHeadings, WithStyles, WithTitle
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
        $rows[] = ['CASH FLOW STATEMENT'];
        $rows[] = ['Period', $this->data['period']['start_date'], 'to', $this->data['period']['end_date']];
        $rows[] = [];

        // Summary
        $rows[] = ['SUMMARY'];
        $rows[] = ['Total Inflow', number_format($this->data['summary']['total_inflow'], 2)];
        $rows[] = ['Total Outflow', number_format($this->data['summary']['total_outflow'], 2)];
        $rows[] = ['Net Cash Flow', number_format($this->data['summary']['net_cash_flow'], 2)];
        $rows[] = [];

        // Inflows
        $rows[] = ['CASH INFLOWS'];
        $rows[] = ['Journal Number', 'Date', 'Description', 'Account', 'Amount'];
        foreach ($this->data['inflows'] as $inflow) {
            foreach ($inflow->items as $item) {
                $rows[] = [
                    $inflow->journal_number,
                    $inflow->date,
                    $inflow->description,
                    $item->account->account_name,
                    $item->debit,
                ];
            }
        }
        $rows[] = ['Total Inflow', '', '', '', $this->data['summary']['total_inflow']];
        $rows[] = [];

        // Outflows
        $rows[] = ['CASH OUTFLOWS'];
        $rows[] = ['Journal Number', 'Date', 'Description', 'Account', 'Amount'];
        foreach ($this->data['outflows'] as $outflow) {
            foreach ($outflow->items as $item) {
                $rows[] = [
                    $outflow->journal_number,
                    $outflow->date,
                    $outflow->description,
                    $item->account->account_name,
                    $item->debit,
                ];
            }
        }
        $rows[] = ['Total Outflow', '', '', '', $this->data['summary']['total_outflow']];
        $rows[] = [];
        $rows[] = ['NET CASH FLOW', '', '', '', $this->data['summary']['net_cash_flow']];

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
        ];
    }

    public function title(): string
    {
        return 'Cash Flow';
    }
}
