import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const PdfExportShowcase: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSamplePdf = async () => {
    setIsGenerating(true);
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      // Dark Brand Header matching App.tsx
      doc.setFillColor(11, 15, 25);
      doc.rect(0, 0, pageWidth, 42, 'F');

      // Title & Subtitle
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('AUTO TRAVEL EXPENSE REPORT', 14, 20);

      doc.setTextColor(16, 185, 129); // #10B981
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('OFFICIAL DAILY COMMUTE LEDGER & REIMBURSEMENT STATEMENT', 14, 28);

      // Meta info on the right
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, pageWidth - 14, 18, { align: 'right' });
      doc.text('Account: student_demo@campus.edu', pageWidth - 14, 24, { align: 'right' });
      doc.text('Status: Verified Ledger Audit', pageWidth - 14, 30, { align: 'right' });

      // Financial Summary Title
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('Helvetica', 'bold');
      doc.text('Travel Financial Summary', 14, 52);

      // 2 Summary Boxes
      const boxW = (pageWidth - 28 - 6) / 2;
      const boxH = 22;
      const startY = 57;

      // Box 1
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.rect(14, startY, boxW, boxH, 'FD');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('COMMUTE SPEND (CURRENT MONTH)', 18, startY + 7);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.text('Rs. 1,420.00', 18, startY + 16);

      // Box 2
      doc.rect(14 + boxW + 6, startY, boxW, boxH, 'FD');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.text('ALLOCATED MONTHLY BUDGET', 14 + boxW + 10, startY + 7);
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(14);
      doc.text('Rs. 2,000.00 (71% Used)', 14 + boxW + 10, startY + 16);

      // Table Title
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont('Helvetica', 'bold');
      doc.text('Chronological Travel Logs', 14, 91);

      // Table Rows
      const tableRows = [
        ['1', '02 Oct 2026', 'Home to College (North Campus)', 'Rs. 25.00'],
        ['2', '02 Oct 2026', 'College to Metro Station Return', 'Rs. 30.00'],
        ['3', '01 Oct 2026', 'Shared Auto (Station Connector)', 'Rs. 40.00'],
        ['4', '01 Oct 2026', 'College to Home (Late Evening)', 'Rs. 25.00'],
        ['5', '30 Sep 2026', 'Library Shuttle to North Gate', 'Rs. 20.00'],
        ['6', '30 Sep 2026', 'Station Connector Shared Auto', 'Rs. 40.00'],
        ['7', '29 Sep 2026', 'Campus to Project Workshop Hub', 'Rs. 60.00'],
        ['8', '29 Sep 2026', 'Return Trip Home', 'Rs. 25.00']
      ];

      autoTable(doc, {
        startY: 96,
        head: [['S. No.', 'Date', 'Route / Travel Note', 'Fare Amount']],
        body: tableRows,
        theme: 'striped',
        headStyles: {
          fillColor: [11, 15, 25],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'left'
        },
        columnStyles: {
          0: { cellWidth: 18 },
          1: { cellWidth: 32 },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        styles: {
          fontSize: 8.5,
          cellPadding: 3
        }
      });

      // Save PDF file to visitor's computer
      doc.save('AutoPay-Sample-Commute-Statement.pdf');
    } catch (err) {
      console.error('Failed to generate sample PDF:', err);
    } finally {
      setTimeout(() => setIsGenerating(false), 500);
    }
  };

  return (
    <section id="pdf-export-feature" className="py-16 sm:py-24 border-b border-[#E5E7EB] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0E131F] transition-colors relative overflow-hidden">
      {/* Background ledger grid */}
      <div className="absolute inset-0 ledger-paper-grid opacity-50 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] font-mono text-[11px] font-bold uppercase tracking-wider mb-2 border border-[#10B981]/25">
            <FileText className="w-3.5 h-3.5" />
            <span>[04 / Official Records &amp; Proof]</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] dark:text-white tracking-tight">
            One-click PDF statements.
            <span className="block mt-1 font-semibold text-[#10B981]">
              Ready for parents, colleges, and workplace claims.
            </span>
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#6B7280] dark:text-[#94A3B8] mt-3 leading-relaxed">
            Need to prove your commute expenses or account for monthly pocket money? AutoPay formats your entire log history into an official, itemized travel report in a fraction of a second.
          </p>
        </div>

        {/* Side-by-Side Showcase: Left Details / Right PDF Glimpse */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Feature Highlights & Interactive Action */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center gap-2 font-display font-bold text-sm text-[#111827] dark:text-white">
                  <div className="w-6 h-6 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center text-xs">
                    1
                  </div>
                  <span>Instant Client-Side Generation</span>
                </div>
                <p className="font-sans text-xs text-[#6B7280] dark:text-[#94A3B8] leading-relaxed">
                  Generated entirely inside your browser with <code className="font-mono text-[#10B981] bg-[#10B981]/10 px-1 py-0.5 rounded">jsPDF</code>. No server queue, no wait times, and zero third-party PDF services inspecting your data.
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center gap-2 font-display font-bold text-sm text-[#111827] dark:text-white">
                  <div className="w-6 h-6 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center text-xs">
                    2
                  </div>
                  <span>Structured Financial Summary</span>
                </div>
                <p className="font-sans text-xs text-[#6B7280] dark:text-[#94A3B8] leading-relaxed">
                  Highlights monthly commute spending, active budget utilization percentage, and chronological trip tallies with accurate route descriptions.
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#121826] border border-[#E5E7EB] dark:border-[#1E293B] rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center gap-2 font-display font-bold text-sm text-[#111827] dark:text-white">
                  <div className="w-6 h-6 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center text-xs">
                    3
                  </div>
                  <span>Reimbursement Ready</span>
                </div>
                <p className="font-sans text-xs text-[#6B7280] dark:text-[#94A3B8] leading-relaxed">
                  Export specific date ranges or filtered routes (e.g. project travels) for hostel allowance, internship reimbursements, or college travel subsidies.
                </p>
              </div>
            </div>

            {/* Interactive Download Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={generateSamplePdf}
                disabled={isGenerating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-mono text-xs sm:text-sm font-bold tracking-wide shadow-lg shadow-[#10B981]/25 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981]"
                title="Generate and download actual sample statement PDF"
              >
                <Download className={`w-4 h-4 ${isGenerating ? 'animate-bounce' : ''}`} />
                <span>{isGenerating ? 'Generating PDF...' : 'Download Sample Statement (.pdf)'}</span>
              </button>
              <span className="block mt-2 text-[10px] font-mono text-[#6B7280] dark:text-[#94A3B8]">
                Real test output from the app's jsPDF engine. No sign up required.
              </span>
            </div>

          </div>

          {/* Right Column: The "PDF Glimpse" Document Preview */}
          <div className="lg:col-span-7 flex justify-center">
            
            {/* A4 Sheet Container */}
            <div className="w-full max-w-[500px] bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 relative select-none font-sans text-xs">
              
              {/* Document Header Bar */}
              <div className="bg-[#0B0F19] text-white -m-5 sm:-m-7 p-4 sm:p-5 rounded-t-xl mb-5 border-b-2 border-[#10B981]">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display font-extrabold text-base sm:text-lg tracking-tight uppercase">
                      Auto Travel Expense Report
                    </h3>
                    <p className="text-[10px] text-[#10B981] font-mono tracking-wide mt-0.5">
                      OFFICIAL COMMUTE LEDGER &amp; REIMBURSEMENT STATEMENT
                    </p>
                  </div>
                  <div className="text-right font-mono text-[9px] text-slate-400 space-y-0.5">
                    <div>DATE: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    <div className="text-[#10B981]">STATUS: VERIFIED AUDIT</div>
                  </div>
                </div>
              </div>

              {/* Financial Summary Title */}
              <div className="mb-3">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-slate-800">
                  Travel Financial Summary
                </span>
              </div>

              {/* Summary Metric Cards */}
              <div className="grid grid-cols-2 gap-3 mb-5 font-mono">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">
                    Spent in Current Month
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-slate-900 font-tabular mt-0.5 block">
                    Rs. 1,420.00
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">
                    Target Budget Allowance
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-[#10B981] font-tabular mt-0.5 block">
                    Rs. 2,000.00
                  </span>
                </div>
              </div>

              {/* Chronological Table Title */}
              <div className="flex justify-between items-center mb-2">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-slate-800">
                  Chronological Travel Logs
                </span>
                <span className="font-mono text-[9px] text-slate-500">
                  Page 1 of 1
                </span>
              </div>

              {/* Structured PDF Table Preview */}
              <div className="border border-slate-200 rounded-lg overflow-hidden font-mono text-[10.5px]">
                <table className="w-full text-left">
                  <thead className="bg-[#0B0F19] text-white text-[9.5px] uppercase">
                    <tr>
                      <th className="py-2 px-2.5 w-10">S.No</th>
                      <th className="py-2 px-2.5">Date</th>
                      <th className="py-2 px-2.5">Route / Travel Note</th>
                      <th className="py-2 px-2.5 text-right">Fare</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-tabular">
                    <tr className="bg-white">
                      <td className="py-2 px-2.5 font-bold text-slate-400">1</td>
                      <td className="py-2 px-2.5 text-slate-900 font-medium">02 Oct 2026</td>
                      <td className="py-2 px-2.5 text-slate-900">Home to College (North Campus)</td>
                      <td className="py-2 px-2.5 text-right font-bold text-[#10B981]">Rs. 25.00</td>
                    </tr>
                    <tr className="bg-slate-50/70">
                      <td className="py-2 px-2.5 font-bold text-slate-400">2</td>
                      <td className="py-2 px-2.5 text-slate-900 font-medium">02 Oct 2026</td>
                      <td className="py-2 px-2.5 text-slate-900">College to Metro Station Return</td>
                      <td className="py-2 px-2.5 text-right font-bold text-[#10B981]">Rs. 30.00</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-2 px-2.5 font-bold text-slate-400">3</td>
                      <td className="py-2 px-2.5 text-slate-900 font-medium">01 Oct 2026</td>
                      <td className="py-2 px-2.5 text-slate-900">Shared Auto (Station Connector)</td>
                      <td className="py-2 px-2.5 text-right font-bold text-[#10B981]">Rs. 40.00</td>
                    </tr>
                    <tr className="bg-slate-50/70">
                      <td className="py-2 px-2.5 font-bold text-slate-400">4</td>
                      <td className="py-2 px-2.5 text-slate-900 font-medium">01 Oct 2026</td>
                      <td className="py-2 px-2.5 text-slate-900">College to Home (Late Evening)</td>
                      <td className="py-2 px-2.5 text-right font-bold text-[#10B981]">Rs. 25.00</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="py-2 px-2.5 font-bold text-slate-400">5</td>
                      <td className="py-2 px-2.5 text-slate-900 font-medium">30 Sep 2026</td>
                      <td className="py-2 px-2.5 text-slate-900">Station Connector Shared Auto</td>
                      <td className="py-2 px-2.5 text-right font-bold text-[#10B981]">Rs. 40.00</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-100/80 border-t border-slate-200 font-bold text-slate-900">
                    <tr>
                      <td colSpan={3} className="py-2 px-2.5 uppercase text-[9.5px]">
                        Reconciled Statement Total
                      </td>
                      <td className="py-2 px-2.5 text-right text-[#10B981] font-bold">
                        Rs. 1,420.00
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Watermark / Stamp Details */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[9px] font-mono text-slate-400">
                <span>AUTOPAY ENCRYPTED LOCAL ENGINE</span>
                <span className="text-[#10B981] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> OFFICIAL REPORT
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
