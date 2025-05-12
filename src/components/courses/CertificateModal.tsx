
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Certificate } from "./Certificate";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: {
    userName: string;
    courseTitle: string;
    completionDate: string;
    certificateId: string;
  } | null;
}

export function CertificateModal({ isOpen, onClose, certificateData }: CertificateModalProps) {
  if (!certificateData) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-center">Your Certificate</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Certificate 
            userName={certificateData.userName}
            courseTitle={certificateData.courseTitle}
            completionDate={certificateData.completionDate}
            certificateId={certificateData.certificateId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
