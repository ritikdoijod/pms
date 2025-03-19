import { useParams } from "next/navigation"

const useWorkspaceId = () => {
  const { id } = useParams();
  return id;
}

export { useWorkspaceId };
