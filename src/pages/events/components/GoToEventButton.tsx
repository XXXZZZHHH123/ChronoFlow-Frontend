import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function GoToEventButton({ id }: { id: string }) {
  const navigate = useNavigate();

  const onOpen = () => {
    navigate(`/event/${id}/tasks`);
  };

  return (
    <Button size="sm" variant="secondary" onClick={onOpen}>
      Go to event
      <ArrowRight className="ml-1 h-4 w-4" />
    </Button>
  );
}
