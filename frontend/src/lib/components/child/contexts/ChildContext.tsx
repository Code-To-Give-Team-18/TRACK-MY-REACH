import { createContext, ReactNode, useContext } from "react";
import { Child } from "../shared/types/Child";
import { useChild } from "../hooks/useChild";

const ChildContext = createContext<ChildContextType | undefined>(undefined);

interface ChildContextType {
  child: Child | undefined;
  setChild: React.Dispatch<React.SetStateAction<Child | undefined>>;
  loading: boolean;
  refetch: () => void;
}

interface ChildProviderProps {
  childId: string;
  children: ReactNode;
}

export const ChildProvider = ({ childId, children } : ChildProviderProps) => {
  const { child, setChild, loading, refetch } = useChild(childId);
  console.log("child", child);

  const contextValue: ChildContextType = {
    child,
    setChild,
    loading,
    refetch,
  };

  return (
    <ChildContext.Provider value={contextValue}>
      {children}
    </ChildContext.Provider>
  );
}

export const useChildContext = () => {
  const context = useContext(ChildContext);
  if (!context) throw new Error("invalid context");
  return context;
}
