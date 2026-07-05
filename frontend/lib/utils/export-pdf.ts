import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface ExportColumn {
  key: string
  label: string
  format?: (value: any) => string
}

export const exportToPDF = (
  data: any[],
  columns: ExportColumn[],
  filename: string,
  title?: string
) => {
  const doc = new jsPDF()

  // Add title if provided
  if (title) {
    doc.setFontSize(18)
    doc.text(title, 14, 22)
    doc.setFontSize(11)
  }

  // Format data for export
  const formattedData = data.map((row) => {
    return columns.map((column) => {
      const value = row[column.key]
      return column.format ? column.format(value) : value || ''
    })
  })

  // Create table headers
  const headers = [columns.map((column) => column.label)]

  // Add table to PDF
  autoTable(doc, {
    head: headers,
    body: formattedData,
    startY: title ? 30 : 14,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  })

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fullFilename = `${filename}_${timestamp}.pdf`

  // Save PDF
  doc.save(fullFilename)
}
