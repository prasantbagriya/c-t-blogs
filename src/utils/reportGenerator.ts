import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a high-fidelity PDF from the CampaignReport component.
 * Uses html2canvas to capture the visual output and jsPDF to save as A4.
 */
export const downloadCampaignReport = async (campaignName: string) => {
  const element = document.getElementById('campaign-report-capture');
  if (!element) {
    alert('Error: Report element not found. Please ensure the report is visible.');
    return;
  }

  try {
    // Show a loading feedback if possible, or just wait
    await new Promise(resolve => setTimeout(resolve, 1000));

    const canvas = await html2canvas(element, {
      scale: 2, 
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      // CRITICAL: Force a desktop-like width for capture even on mobile
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById('campaign-report-capture');
        if (clonedElement) {
          clonedElement.style.width = '1000px';
          clonedElement.style.padding = '40px';
          clonedElement.style.margin = '0';
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    
    const safeName = campaignName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    pdf.save(`ChatWizs_Report_${safeName}.pdf`);
    
    return true;
  } catch (error: any) {
    alert('Mobile PDF Generation Error: ' + error.message);
    return false;
  }
};
