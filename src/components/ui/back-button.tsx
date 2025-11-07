import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "./button";

export const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Button 
      variant="neutral" 
      size="icon" 
      className="rounded-base"
      onClick={handleBack}
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
};

