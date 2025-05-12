
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Certificate } from "./Certificate";
import { CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: {
    userName: string;
    courseTitle: string;
    completionDate: string;
    certificateId: string;
    appName?: string;
  } | null;
  isProcessing?: boolean;
  appName?: string;
}

export function CertificateModal({ 
  isOpen, 
  onClose, 
  certificateData, 
  isProcessing = false,
  appName = "Tech Learn" // Updated default app name
}: CertificateModalProps) {
  
  // Force certificate to show after 2 seconds regardless of processing state
  const [forceShowCertificate, setForceShowCertificate] = useState(false);
  
  // Reset force state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // If processing, wait 2 seconds then force show
      if (isProcessing) {
        const timer = setTimeout(() => {
          setForceShowCertificate(true);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } else {
      setForceShowCertificate(false);
    }
  }, [isOpen, isProcessing]);
  
  // Show certificate if we have data and not processing or force show is true
  const showCertificate = certificateData && (!isProcessing || forceShowCertificate);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isProcessing && !forceShowCertificate ? "Preparing Your Certificate..." : "Your Certificate"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isProcessing && !forceShowCertificate ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-gradient-to-b from-gray-900 to-gray-950 text-white rounded-lg">
              <CheckCircle className="h-16 w-16 text-blue-400 animate-pulse" />
              <h3 className="text-xl font-medium">Get Certified</h3>
              <p className="text-center text-gray-300">
                Your certificate is being prepared...
              </p>
              <div className="w-full max-w-xs bg-gray-800 rounded-full h-2 mt-4">
                <div className="animate-pulse bg-blue-600 h-2 rounded-full w-2/3"></div>
              </div>
              <p className="text-sm text-blue-300">Almost ready...</p>
            </div>
          ) : showCertificate ? (
            <Certificate 
              userName={certificateData.userName}
              courseTitle={certificateData.courseTitle}
              completionDate={certificateData.completionDate}
              certificateId={certificateData.certificateId}
              appName={appName}
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">Certificate data not available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
