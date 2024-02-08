import { createContext, FC, useContext, useEffect, useState } from "react";
import { HomeMasterManager } from "./HomeMasterManager";

const HomeMasterContext = createContext<PublicHomeMasterContext>(null as any);
export const useHomeMasterContext = () => useContext(HomeMasterContext);

interface ProviderProps {
  homeMasterManager: HomeMasterManager
}

interface PublicHomeMasterManager {
  carouselCollectionId: string;
}
interface PublicHomeMasterContext extends PublicHomeMasterManager {
  homeMasterManager: HomeMasterManager
}

export const HomeMasterContextProvider: FC<ProviderProps> = ({ children, homeMasterManager }) => {
  const [publicState, setPublicState] = useState<PublicHomeMasterManager>({
    carouselCollectionId: homeMasterManager.getCarouselCollectionId()
  });

  useEffect(() => {
    function onUpdate() {
      setPublicState({ carouselCollectionId: homeMasterManager.getCarouselCollectionId() });
    }

    homeMasterManager.eventBus.addEventListener("stateUpdate", onUpdate);

    return () => {
      homeMasterManager.eventBus.removeEventListener("stateUpdate", onUpdate);
    }
  }, []);

  return (
    <HomeMasterContext.Provider
      value={{
        ...publicState,
        homeMasterManager
      }}
    >
      {children}
    </HomeMasterContext.Provider>
  )
}
