import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

interface PDFPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pdfBlob: Blob | null;
  fileName: string;
  title?: string;
}

export const PDFPreview = ({ open, onOpenChange, pdfBlob, fileName, title = "PDF Preview" }: PDFPreviewProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

      // Cleanup URL when component unmounts or blob changes
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPdfUrl(null);
    }
  }, [pdfBlob]);

  const handleDownload = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] max-h-[95vh] p-0 flex flex-col !translate-x-[-50%] !translate-y-[-50%]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>Review the PDF before downloading</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleDownload} size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div 
          className="flex-1 overflow-auto bg-gray-100" 
          style={{ 
            minHeight: 0, 
            height: 'calc(95vh - 100px)',
            maxHeight: 'calc(95vh - 100px)'
          }}
        >
          {pdfUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&zoom=page-width`}
                className="w-full border-0"
                title="PDF Preview"
                style={{ 
                  width: '100%', 
                  minHeight: '100%',
                  height: '100%',
                  display: 'block'
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading PDF preview...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
