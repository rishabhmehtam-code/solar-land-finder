'use client';

import React from 'react';
import { FileDown, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import type { Parcel, SearchParams } from '@/types';

interface ExportOptionsProps {
  parcels: Parcel[];
  searchParams: SearchParams;
}

export function ExportOptions({ parcels, searchParams }: ExportOptionsProps) {
  const handleExportCSV = () => {
    if (parcels.length === 0) return;

    const csvData = parcels.map((p) => ({
      'Plot Number': p.plotNumber,
      'Village': p.village,
      'District': p.district,
      'Area (acres)': p.area.toFixed(2),
      'Distance (km)': p.distanceFromSubstation.toFixed(2),
      'Slope (°)': p.slope.toFixed(2),
      'Flood Risk': p.floodRisk,
      'Road Access': p.roadAccess ? 'Yes' : 'No',
      'Clear Title': p.clearTitle ? 'Yes' : 'No',
      'Viability Score': p.viabilityScore.toFixed(1),
      'Latitude': p.lat.toFixed(6),
      'Longitude': p.lng.toFixed(6),
    }));

    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Parcels');
    XLSX.writeFile(wb, `parcels-export-${Date.now()}.xlsx`);
  };

  const handleExportPDF = () => {
    if (parcels.length === 0) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPos = 10;

    pdf.setFontSize(16);
    pdf.text('Solar Land Finder - Parcel Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    pdf.setFontSize(10);
    pdf.text(`Search Radius: ${searchParams.radius} km`, 10, yPos);
    yPos += 5;
    pdf.text(`Capacity: ${searchParams.capacity} MWAC`, 10, yPos);
    yPos += 5;
    pdf.text(`Land per MWAC: ${searchParams.landPerMWAC} acres`, 10, yPos);
    yPos += 8;

    pdf.setFontSize(9);
    pdf.setFillColor(59, 130, 246);
    pdf.setTextColor(255, 255, 255);
    const columns = ['Plot', 'Village', 'Area', 'Distance', 'Score'];
    const colWidths = [25, 40, 25, 30, 20];
    let xPos = 10;

    columns.forEach((col, i) => {
      pdf.text(col, xPos, yPos, { maxWidth: colWidths[i] });
      xPos += colWidths[i];
    });

    yPos += 6;
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(240, 240, 240);

    parcels.slice(0, 15).forEach((parcel) => {
      if (yPos > pageHeight - 20) {
        pdf.addPage();
        yPos = 10;
      }

      xPos = 10;
      pdf.text(parcel.plotNumber, xPos, yPos, { maxWidth: colWidths[0] });
      xPos += colWidths[0];
      pdf.text(parcel.village.substring(0, 12), xPos, yPos, { maxWidth: colWidths[1] });
      xPos += colWidths[1];
      pdf.text(`${parcel.area.toFixed(1)}ac`, xPos, yPos, { maxWidth: colWidths[2] });
      xPos += colWidths[2];
      pdf.text(`${parcel.distanceFromSubstation.toFixed(1)}km`, xPos, yPos, { maxWidth: colWidths[3] });
      xPos += colWidths[3];
      pdf.text(`${parcel.viabilityScore.toFixed(0)}%`, xPos, yPos, { maxWidth: colWidths[4] });

      yPos += 6;
    });

    pdf.save(`solar-parcels-report-${Date.now()}.pdf`);
  };

  const handleExportKMZ = () => {
    if (parcels.length === 0) return;

    let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Solar Land Parcels</name>
    <description>Land parcels for solar development</description>`;

    parcels.forEach((parcel) => {
      kmlContent += `
    <Placemark>
      <name>${parcel.plotNumber}</name>
      <description>
        Village: ${parcel.village}
        District: ${parcel.district}
        Area: ${parcel.area.toFixed(1)} acres
        Viability: ${parcel.viabilityScore}%
      </description>
      <Point>
        <coordinates>${parcel.lng},${parcel.lat},0</coordinates>
      </Point>
    </Placemark>`;
    });

    kmlContent += `
  </Document>
</kml>`;

    const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kmz' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solar-parcels-${Date.now()}.kmz`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isDisabled = parcels.length === 0;

  return (
    <div className="space-y-2">
      <button
        onClick={handleExportCSV}
        disabled={isDisabled}
        className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        <FileDown className="w-4 h-4" />
        Export Excel
      </button>
      <button
        onClick={handleExportPDF}
        disabled={isDisabled}
        className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        <FileDown className="w-4 h-4" />
        Export PDF
      </button>
      <button
        onClick={handleExportKMZ}
        disabled={isDisabled}
        className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        KMZ (Google Earth)
      </button>
    </div>
  );
}
