
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./button";

interface BackButtonProps {
  href?: string;
  className?: string;
}

export function BackButton({ href, className }: BackButtonProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (href) {
      navigate(href);
    } else {
      navigate(-1);
    }
  };
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={`gap-2 hover:bg-transparent ${className || ""}`}
    >
      <ChevronLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
