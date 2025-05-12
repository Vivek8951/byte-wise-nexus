
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Certificate } from "./Certificate";
import { CheckCircle } from "lucide-react";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: {
    userName: string;
    courseTitle: string;
    completionDate: string;
    certificateId: string;
  } | null;
  isProcessing?: boolean;
  appName?: string;
}

export function CertificateModal({ 
  isOpen, 
  onClose, 
  certificateData, 
  isProcessing = false,
  appName = "EduLMS" 
}: CertificateModalProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isProcessing ? "Processing Certificate..." : "Your Certificate"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-gradient-to-b from-gray-900 to-gray-950 text-white rounded-lg">
              <CheckCircle className="h-16 w-16 text-blue-400 animate-pulse" />
              <h3 className="text-xl font-medium">Get Certified</h3>
              <p className="text-center text-gray-300">
                Complete this course to earn a certificate
              </p>
              <div className="w-full max-w-xs bg-gray-800 rounded-full h-2 mt-4">
                <div className="animate-pulse bg-blue-600 h-2 rounded-full w-2/3"></div>
              </div>
              <p className="text-sm text-blue-300">Processing Certificate...</p>
            </div>
          ) : certificateData ? (
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
