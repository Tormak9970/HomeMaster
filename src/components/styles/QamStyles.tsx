import { gamepadDialogClasses, quickAccessControlsClasses } from "decky-frontend-lib";
import { VFC } from "react";

/**
 * All css styling for the Quick Access Menu part of TabMaster.
 */
export const QamStyles: VFC<{}> = ({}) => {
  return (
    <style>{`
      .home-master-scope {
        width: inherit;
        height: inherit;

        flex: 1 1 1px;
        scroll-padding: 48px 0px;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-content: stretch;
      }

      .home-master-scope .${quickAccessControlsClasses.PanelSection} {
        padding: 0px;
      }
      .home-master-scope .${quickAccessControlsClasses.PanelSectionTitle} {
        margin-top: 3px;
        margin-left: 5px;
      }

      .home-master-scope .${gamepadDialogClasses.FieldChildren} {
        margin: 0px 16px;
      }
      .home-master-scope .${gamepadDialogClasses.FieldLabel} {
        margin-left: 16px;
      }

      .home-master-scope .seperator {
        width: 100%;
        height: 1px;
        background: #23262e;
      }
    `}</style>
  );
}
