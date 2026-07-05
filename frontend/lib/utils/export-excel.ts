import * as XLSX from 'xlsx'

export interface ExportColumn {
  key: string
  label: string
  format?: (value: any) => string
}

export const exportToExcel = (
 数据: any[],
  columns: ExportColumn[],
  filename: string
) => {
  // Format data for export
  const formattedData = 数据.map((row) => {
    const formattedRow: any = {}
    columns.forEach((column) => {
      const value = row[column.key]
      formattedRow[column.label] = column.format
        ? column.format(value)
        : value || ''
    })
    return formattedRow
  })

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(formattedData)

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fullFilename = `${filename}_${timestamp}.xlsx`

  // Download file
  XLSX.writeFile(workbook, fullFilename)
}
