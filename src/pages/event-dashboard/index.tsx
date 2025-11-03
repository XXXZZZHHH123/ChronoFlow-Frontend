import { useParams } from "react-router-dom";

export default function SpecificEventDashboardPage() {
  const { id } = useParams<{ id: string }>();

  return <p>Specific event{id ? `: ${id}` : ""}</p>;
}
