import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { exportService } from "@/services";
import {
  FileText,
  FileSpreadsheet,
  Download,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [csvLoading, setCsvLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const token = localStorage.getItem("fin.token");

  const handleCSVExport = async () => {
    if (!token) {
      toast.error("Please login to download reports");
      return;
    }
    setCsvLoading(true);
    try {
      await exportService.downloadCSV();
      toast.success("CSV downloaded successfully! 📊");
    } catch (err) {
      toast.error("Export failed. Make sure the backend server is running.");
    } finally {
      setCsvLoading(false);
    }
  };

  const handlePDFExport = async () => {
    if (!token) {
      toast.error("Please login to download reports");
      return;
    }
    setPdfLoading(true);
    try {
      await exportService.downloadPDF();
      toast.success("PDF downloaded successfully! 📄");
    } catch (err) {
      toast.error("Export failed. Make sure the backend server is running.");
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Reports & Export 📄"
        subtitle="Download your expense history as CSV or PDF."
      />

      {!token && (
        <Card className="p-5 mb-4 border-destructive/20 bg-destructive/5 shadow-soft">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-destructive mt-0.5" />
            <p className="text-sm">
              <strong>Login required</strong> to download reports. Reports are
              generated from your cloud-synced backend data.
            </p>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
            <FileSpreadsheet className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="font-bold text-lg mb-1">CSV Export</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Download all your expenses as a spreadsheet. Compatible with Excel,
            Google Sheets, and any CSV reader.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 mb-6">
            <li>✅ Date, Title, Category, Amount, Payment Method</li>
            <li>✅ All-time expense history</li>
            <li>✅ Import into any finance tool</li>
          </ul>
          <Button
            className="w-full gradient-primary"
            onClick={handleCSVExport}
            disabled={csvLoading}
          >
            {csvLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {csvLoading ? "Generating..." : "Download CSV"}
          </Button>
        </Card>

        <Card className="p-6 shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all">
          <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="font-bold text-lg mb-1">PDF Report</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Generate a formatted PDF statement with all your transactions and a
            total spending summary.
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 mb-6">
            <li>✅ Formatted expense listing</li>
            <li>✅ Total spending summary at bottom</li>
            <li>✅ Print or share digitally</li>
          </ul>
          <Button
            className="w-full gradient-primary"
            onClick={handlePDFExport}
            disabled={pdfLoading}
          >
            {pdfLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {pdfLoading ? "Generating..." : "Download PDF"}
          </Button>
        </Card>
      </div>

      <Card className="p-5 mt-4 shadow-soft border-primary/20 bg-primary/5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h4 className="font-medium text-sm">Privacy First</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your data is only accessible with your JWT token. Reports are
              generated server-side and downloaded directly to your device.
              Nothing is shared with third parties.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
