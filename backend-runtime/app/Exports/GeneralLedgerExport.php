<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class GeneralLedgerExport implements FromCollection, WithHeadings, WithStyles, WithTitle
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
        $rows[] = ['GENERAL LEDGER'];
        $rows[] = ['Period', $this->data['period']['start_date'], 'to', $this->data['period']['end_date']];
        $rows[] = [];

        // Journal entries
        $rows[] = ['JOURNAL ENTRIES'];
        $rows[] = ['Journal Number', 'Date', 'Description', 'Account Number', 'Account Name', 'Debit', 'Credit', 'Created By', 'Approved By', 'Status'];
        
        foreach ($this->data['journals'] as $journal) {
            foreach ($journal->items as $item) {
                $rows[] = [
                    $journal->journal_number,
                    $journal->date,
                    $journal->description,
                    $item->account->account_number,
                    $item->account->account_name,
                    $item->debit,
                    $item->credit,
                    $journal->creator->name ?? 'N/A',
                    $journal->approver->name ?? 'N/A',
                    $journal->status,
                ];
            }
        }

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
            5 => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        return 'General Ledger';
    }
}
