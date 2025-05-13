
import { useRef, useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface CertificateProps {
  userName: string;
  courseTitle: string;
  completionDate: string;
  certificateId: string;
  appName?: string;
}

export function Certificate({ 
  userName, 
  courseTitle, 
  completionDate, 
  certificateId,
  appName = "Tech Learn"
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const currentDate = format(new Date(), "MMMM dd, yyyy");
  
  // Auto download certificate when component mounts
  useEffect(() => {
    // Small delay to ensure the certificate is rendered
    const timer = setTimeout(() => {
      downloadCertificate();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  
  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    
    try {
      console.log("Starting certificate download process");
      toast({
        title: "Preparing Certificate", 
        description: "Your certificate is being prepared for download..."
      });
      
      const canvas = await html2canvas(certificateRef.current, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff" 
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`${userName}-${courseTitle}-Certificate.pdf`);
      
      console.log("Certificate downloaded successfully");
      toast({
        title: "Success!",
        description: "Certificate downloaded successfully!"
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="w-full">
      <Card className="mb-4 border-2 border-blue-600 shadow-lg">
        <CardContent className="p-0">
          <div 
            ref={certificateRef}
            className="p-8 min-h-[500px] bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center"
          >
            <div className="w-full h-full p-8 text-center">
              {/* Header with logo and app name */}
              <div className="flex justify-between items-center mb-6">
                <div className="text-xl font-bold text-blue-800">Tech Learn</div>
                <div className="text-right text-gray-500">Issue Date: {currentDate}</div>
              </div>
              
              {/* Certificate title */}
              <h1 className="text-4xl font-bold text-blue-900 mb-2 mt-6">Certificate of Completion</h1>
              <div className="w-32 h-1 bg-blue-700 mx-auto mb-8"></div>
              
              {/* Certificate body */}
              <div className="my-10">
                <p className="text-lg text-gray-700 mb-4">This is to certify that</p>
                <h2 className="text-3xl font-bold text-blue-800 mb-6 font-serif">{userName}</h2>
                <p className="text-lg text-gray-700 mb-4">has successfully completed the course</p>
                <h3 className="text-2xl font-bold text-blue-900 mb-6 px-10">"{courseTitle}"</h3>
                <p className="text-lg text-gray-700">on {completionDate}</p>
              </div>
              
              <Separator className="my-6 bg-gray-300" />
              
              {/* Footer */}
              <div className="flex justify-between items-center mt-8">
                <div className="text-left">
                  <p className="text-sm text-gray-600">Certificate ID: {certificateId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Tech Learn Certificate</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Button 
        onClick={downloadCertificate} 
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 certificate-download-btn"
      >
        <Download className="h-4 w-4" />
        Download Certificate
      </Button>
    </div>
  );
}
