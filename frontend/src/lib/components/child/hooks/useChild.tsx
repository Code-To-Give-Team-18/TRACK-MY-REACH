import { useEffect, useState } from "react";
import { Child } from "../shared/types/Child";

export const useChild = (childId: string) => {
  const [child, setChild] = useState<Child>();
  const [loading, setLoading] = useState<boolean>(true);

  const fetchChild = async () => {
    const response = await fetch(`http://localhost:8080/api/v1/children/${childId}`);
    const childBody = await response.json();
    setLoading(false);
    setChild(childBody);
  };

  useEffect(() => {
    fetchChild();
  }, []);

  const refetch = () => {
    setLoading(true);
    fetchChild();
  }

  return { child, setChild, loading, refetch };
};
