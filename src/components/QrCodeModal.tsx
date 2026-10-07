import React from 'react';
import { X, QrCode, Download, ExternalLink, Printer } from 'lucide-react';
import { TrainingProject } from '../types';

interface QrCodeModalProps {
  project: TrainingProject | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !project) return null;

  const handleDownload = () => {
    if (!project.evaluationQrCode) return;
    const a = document.createElement('a');
    a.href = project.evaluationQrCode;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}_evaluation_qr.svg`;
    a.click();
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${project.name} - Evaluation Survey QR</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; }
            h1 { font-size: 24px; margin-bottom: 8px; }
            p { font-size: 14px; color: #555; margin-bottom: 24px; }
            img { width: 300px; height: 300px; }
          </style>
        </head>
        <body>
          <h1>${project.name}</h1>
          <p>${project.company} • ${project.provider}</p>
          <img src="${project.evaluationQrCode}" />
          <p style="margin-top: 24px; font-weight: bold;">Scan to complete the session evaluation survey</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center space-x-2">
            <QrCode className="w-4 h-4 text-zinc-900" />
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
              Evaluation QR Standee
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Presentation */}
        <div className="p-6 text-center space-y-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
              {project.company}
            </span>
            <h4 className="text-sm font-bold text-zinc-900 mt-0.5">
              {project.name}
            </h4>
          </div>

          <div className="w-56 h-56 mx-auto p-4 bg-white border border-zinc-200 rounded-xl shadow-2xs flex items-center justify-center">
            {project.evaluationQrCode ? (
              <img
                src={project.evaluationQrCode}
                alt="Evaluation QR Code"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-zinc-400 text-xs">No QR Code Available</div>
            )}
          </div>

          <p className="text-xs text-zinc-500">
            Display on participant table standees or projector screen at the end of the session.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50/70 flex items-center justify-between gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg text-xs font-medium text-zinc-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-zinc-500" />
            <span>Print Standee</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};
