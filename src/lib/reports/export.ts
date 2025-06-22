import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

export interface ExportData {
  title: string
  company: string
  period: { start: string; end: string }
  data: any[]
  summary?: any
}

/**
 * Exporta dados para PDF
 */
export function exportToPDF(exportData: ExportData): void {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.text(exportData.title, 14, 22)
  
  doc.setFontSize(12)
  doc.text(`Empresa: ${exportData.company}`, 14, 32)
  doc.text(`Período: ${new Date(exportData.period.start).toLocaleDateString('pt-BR')} - ${new Date(exportData.period.end).toLocaleDateString('pt-BR')}`, 14, 40)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 48)
  
  // Summary if exists
  let yPosition = 60
  if (exportData.summary) {
    doc.setFontSize(14)
    doc.text('Resumo', 14, yPosition)
    yPosition += 10
    
    const summaryData = [
      ['Métrica', 'Valor'],
      ['Investimento Total', `R$ ${exportData.summary.totalCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`],
      ['Leads Gerados', exportData.summary.totalLeads?.toString() || '0'],
      ['Taxa de Conversão', `${exportData.summary.conversionRate || '0'}%`],
      ['ROAS Médio', `${exportData.summary.avgROAS || '0'}x`]
    ]
    
    ;(doc as any).autoTable({
      startY: yPosition,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    })
    
    yPosition = (doc as any).lastAutoTable.finalY + 20
  }
  
  // Main data table
  if (exportData.data && exportData.data.length > 0) {
    doc.setFontSize(14)
    doc.text('Detalhes', 14, yPosition)
    yPosition += 10
    
    const headers = Object.keys(exportData.data[0])
    const rows = exportData.data.map(item => 
      headers.map(header => {
        const value = item[header]
        if (typeof value === 'number' && header.toLowerCase().includes('cost')) {
          return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        }
        return value?.toString() || ''
      })
    )
    
    ;(doc as any).autoTable({
      startY: yPosition,
      head: [headers.map(h => h.charAt(0).toUpperCase() + h.slice(1))],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 }
    })
  }
  
  // Save
  doc.save(`relatorio-${exportData.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`)
}

/**
 * Exporta dados para Excel
 */
export function exportToExcel(exportData: ExportData): void {
  const wb = XLSX.utils.book_new()
  
  // Summary sheet
  if (exportData.summary) {
    const summaryData = [
      ['Dashboard Tryum - Relatório de Marketing'],
      [],
      ['Empresa:', exportData.company],
      ['Período:', `${new Date(exportData.period.start).toLocaleDateString('pt-BR')} - ${new Date(exportData.period.end).toLocaleDateString('pt-BR')}`],
      ['Gerado em:', new Date().toLocaleString('pt-BR')],
      [],
      ['RESUMO EXECUTIVO'],
      ['Métrica', 'Valor'],
      ['Investimento Total', exportData.summary.totalCost || 0],
      ['Impressões', exportData.summary.totalImpressions || 0],
      ['Cliques', exportData.summary.totalClicks || 0],
      ['Leads Gerados', exportData.summary.totalLeads || 0],
      ['Taxa de Conversão', `${exportData.summary.conversionRate || 0}%`],
      ['CTR Médio', `${exportData.summary.avgCTR || 0}%`],
      ['CPL Médio', exportData.summary.avgCPL || 0],
      ['ROAS Médio', `${exportData.summary.avgROAS || 0}x`]
    ]
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    
    // Style headers
    summarySheet['A1'] = { ...summarySheet['A1'], s: { font: { bold: true, sz: 16 } } }
    summarySheet['A7'] = { ...summarySheet['A7'], s: { font: { bold: true, sz: 14 } } }
    
    // Set column widths
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }]
    
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumo')
  }
  
  // Data sheet
  if (exportData.data && exportData.data.length > 0) {
    const dataSheet = XLSX.utils.json_to_sheet(exportData.data)
    
    // Auto-size columns
    const range = XLSX.utils.decode_range(dataSheet['!ref'] || 'A1')
    const cols: any[] = []
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let max = 10
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = dataSheet[XLSX.utils.encode_cell({ r: R, c: C })]
        if (cell && cell.v) {
          const len = cell.v.toString().length
          if (len > max) max = len
        }
      }
      cols.push({ wch: max + 2 })
    }
    dataSheet['!cols'] = cols
    
    XLSX.utils.book_append_sheet(wb, dataSheet, 'Dados')
  }
  
  // Platform breakdown sheet if available
  if (exportData.summary?.byPlatform) {
    const platformData = Object.entries(exportData.summary.byPlatform).map(([platform, data]: [string, any]) => ({
      Plataforma: platform.replace('_', ' ').toUpperCase(),
      Investimento: data.cost || 0,
      Impressões: data.impressions || 0,
      Cliques: data.clicks || 0,
      Leads: data.leads || 0,
      CTR: `${data.ctr || 0}%`,
      CPL: data.cpl || 0,
      ROAS: `${data.roas || 0}x`
    }))
    
    const platformSheet = XLSX.utils.json_to_sheet(platformData)
    XLSX.utils.book_append_sheet(wb, platformSheet, 'Por Plataforma')
  }
  
  // Save
  XLSX.writeFile(wb, `relatorio-${exportData.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`)
}

/**
 * Exporta dados para CSV
 */
export function exportToCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) return
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = value?.toString() || ''
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    )
  ].join('\n')
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}