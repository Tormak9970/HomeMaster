import { VFC, useEffect } from "react";
import { LogController } from "../lib/controllers/LogController";

import { FaCircleExclamation } from "react-icons/fa6";
import { QamStyles } from "./styles/QamStyles";
import { Dropdown, DropdownOption, Focusable, PanelSection } from "decky-frontend-lib";
import { useHomeMasterContext } from "../state/HomeMasterContext";

/**
 * The Quick Access Menu content for HomeMaster.
 */
export const QuickAccessContent: VFC<{}> = ({ }) => {
  const { carouselCollectionId, homeMasterManager } = useHomeMasterContext();

  const collections: Record<string, Collection> = {
    
  }

  const dropdownOptions: DropdownOption[] = [
    { label: "Recently Played", data: "NO_CHANGE" }
  ];

  useEffect(() => {
    for (const [collectionId, collection] of Object.entries(collections)) {
      dropdownOptions.push({ label: collection.displayName, data: collectionId });
    }
  }, [])

  async function onChange(selectedOption: DropdownOption): Promise<void> {
    const collectionId = selectedOption.data as string;
    await homeMasterManager.setCarouselCollectionId(collectionId);
  }

  return (
    <div className="home-master-scope">
      {LogController.errorFlag && <div style={{ padding: '0 15px', marginBottom: '40px' }}>
        <h3>
          <FaCircleExclamation style={{ height: '.8em', marginRight: '5px' }} fill="red" />
          Home Master encountered an error
        </h3>
        <div style={{ wordWrap: 'break-word' }}>
          Please reach out to
          <br />
          <a href='https://github.com/Tormak9970/TabMaster/issues'>https://github.com/Tormak9970/HomeMaster/issues</a>
          <br />
          {/* or
          <br />
          <a href='https://discord.com/channels/960281551428522045/1049449185214206053'>https://discord.com/channels/960281551428522045/1049449185214206053</a>
          <br />
          for support. */}
        </div>
      </div>}
      <QamStyles />
      <Focusable >
        <div style={{ margin: "5px", marginTop: "0px" }}>
          Here you can customize your Steam home page.
        </div>
        <PanelSection title="Carousel Collection">
          <div className="seperator"></div>
          {homeMasterManager.hasSettingsLoaded ? (
            <Dropdown rgOptions={dropdownOptions} selectedOption={carouselCollectionId} onChange={onChange} />
          ) : (
            <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "5px" }}>
              Loading...
            </div>
          )}
        </PanelSection>
      </Focusable>
    </div>
  );
};
