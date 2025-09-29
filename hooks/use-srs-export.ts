import { useState } from 'react';

export function useSRSExport() {
  const [exporting, setExporting] = useState(false);

  const exportCards = async () => {
    try {
      setExporting(true);

      const response = await fetch('/api/srs/export');
      if (!response.ok) {
        throw new Error('Failed to export cards');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'learninghub-cards.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setExporting(false);
    }
  };

  return {
    exportCards,
    exporting,
  };
}
