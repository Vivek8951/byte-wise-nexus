
import { useRef } from "react";
import { Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import html2canvas from "html2canvas";
// Import jspdf correctly
import { jsPDF } from "jspdf";

interface CertificateProps {
  userName: string;
  courseTitle: string;
  completionDate: string;
  certificateId: string;
}

export function Certificate({ userName, courseTitle, completionDate, certificateId }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    
    try {
      const canvas = await html2canvas(certificateRef.current, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff" 
      });
      
      const imgData = canvas.toDataURL('image/png');
      // Create jsPDF instance with correct constructor
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const width = pdf.internal.pageSize.getWidth();
      const height = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`${userName}-${courseTitle}-Certificate.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };
  
  return (
    <div className="w-full">
      <Card className="mb-4 border-2 border-blue-600 shadow-lg">
        <CardContent className="p-0">
          <div 
            ref={certificateRef}
            className="p-8 min-h-[500px] bg-gradient-to-br from-white to-gray-50 flex flex-col items-center justify-center"
          >
            <div className="border-8 border-double border-gray-800 w-full h-full p-8">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <Award className="h-16 w-16 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Certificate of Completion</h1>
                <p className="text-gray-600">This certifies that</p>
              </div>
              
              <div className="text-center my-8">
                <h2 className="text-4xl font-bold text-blue-800 mb-6">{userName}</h2>
                <p className="text-lg text-gray-700 mb-1">has successfully completed the course</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-3 mb-6">"{courseTitle}"</h3>
                <p className="text-lg text-gray-700">on {completionDate}</p>
              </div>
              
              <Separator className="my-6 bg-gray-300" />
              
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <p className="text-sm text-gray-600">Certificate ID: {certificateId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Digital Certificate</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Button 
        onClick={downloadCertificate} 
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
      >
        <Download className="h-4 w-4" />
        Download Certificate
      </Button>
    </div>
  );
}
