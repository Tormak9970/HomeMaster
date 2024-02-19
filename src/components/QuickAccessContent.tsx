import { VFC, useEffect, Fragment } from "react";
import { LogController } from "../lib/controllers/LogController";

import { FaCircleExclamation } from "react-icons/fa6";
import { QamStyles } from "./styles/QamStyles";
import { Dropdown, DropdownOption, Field, Focusable, PanelSection, SingleDropdownOption } from "decky-frontend-lib";
import { useHomeMasterContext } from "../state/HomeMasterContext";
import { ListSearchDropdown } from "./modals/ListSearchModal";

import { FaUser, FaSteam } from "react-icons/fa6";
import { IoGrid } from "react-icons/io5";
import { IconType } from "react-icons/lib";

/**
 * Filters the userCollections list to remove unwanted entries.
 * @param userCollections The user's collections.
 * @returns The filtered list of collections.
 */
function filterUserCollections(userCollections: Collection[]): Collection[] {
  const idsToRemove: string[] = ["favorite", "type-music"];
  return userCollections.filter((collection) => !idsToRemove.includes(collection.id));
}


/**
 * Gets an entry icon for a collection based on if its user made.
 * @param entry The collection entry.
 * @returns The icon for the collection.
 */
function getCollectionIcon(entry: any): IconType {
  const collection = collectionStore.userCollections.find((collection: Collection) => collection.id === entry.data);
  if (collection?.bIsEditable) {
    return FaUser;
  } else {
    return FaSteam;
  }
}

/**
 * The Quick Access Menu content for HomeMaster.
 */
export const QuickAccessContent: VFC<{}> = ({ }) => {
  const sortBy = "recent";
  const { carouselCollectionId, homeMasterManager } = useHomeMasterContext();

  const COLLECTION_NAME_LUT: Record<string, string> = {
    "All": "All Games",
    "Locally Installed Games": "Installed Games"
  }

  const collections: Collection[] = [ collectionStore.allGamesCollection ];
  collections.push(collectionStore.GetCollection("favorite"));

  if (collectionStore.deckDesktopApps) collections.push(collectionStore.deckDesktopApps);
  if (collectionStore.neptuneGamesCollection) collections.push(collectionStore.neptuneGamesCollection);

  collections.push(...filterUserCollections(collectionStore.userCollections));

  const carouselCollectionOptions: SingleDropdownOption[] = [
    { label: "Recently Played", data: "NO_CHANGE" }
  ];

  const sortByOptions: DropdownOption[] = [
    { label: "Recently Played", data: "recent" },
    { label: "None", data: "none" }
  ]

  useEffect(() => {
    for (const collection of collections) {
      carouselCollectionOptions.push({ label: COLLECTION_NAME_LUT[collection.displayName] ?? collection.displayName, data: collection.id });
    }
  }, []);

  async function onCarouselCollectionChange(selectedOption: DropdownOption): Promise<void> {
    const collectionId = selectedOption.data as string;
    await homeMasterManager.setCarouselCollectionId(collectionId);
  }

  async function onSortByChange(selectedOption: DropdownOption): Promise<void> {

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
        <PanelSection title="Settings">
          {homeMasterManager.hasSettingsLoaded ? (
            <>
              {/* <Dropdown rgOptions={dropdownOptions} selectedOption={carouselCollectionId} onChange={onChange} /> */}
              <Field
                label="Carousel Collection"
                description={
                  <ListSearchDropdown
                    entryLabel="Collections"
                    rgOptions={carouselCollectionOptions}
                    selectedOption={carouselCollectionId}
                    onChange={onCarouselCollectionChange}
                    TriggerIcon={IoGrid}
                    determineEntryIcon={getCollectionIcon}
                  />
                }
              />
              <Field
                label="Sort By"
                description={
                  <Dropdown rgOptions={sortByOptions} selectedOption={sortBy} onChange={onSortByChange} />
                }
              />
            </>
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
