import {
  Button,
  EmptyState,
  EmptyStateActions,
  SimpleList,
  SimpleListItem,
  Split,
  SplitItem,
} from "@patternfly/react-core";
import { InfoIcon } from "@patternfly/react-icons";

import { NavigationPath } from "../OpenApiEditorModels.ts";

export function Paths({
  paths,
  filtered,
}: {
  paths: NavigationPath[];
  filtered: boolean;
}) {
  return (
    <>
      {paths.length > 0 && (
        <SimpleList
          className={"pf-v6-u-font-size-sm"}
          style={{ wordBreak: "break-word" }}
        >
          {paths.map((p) => (
            <SimpleListItem key={p.name}>
              <Split hasGutter={true}>
                <SplitItem isFilled={true}>{p.name}</SplitItem>
                {p.validations.length > 0 && (
                  <SplitItem>
                    <Button variant={"plain"} icon={<InfoIcon />} />
                  </SplitItem>
                )}
              </Split>
            </SimpleListItem>
          ))}
        </SimpleList>
      )}
      {paths.length === 0 && !filtered ? (
        <EmptyState variant={"xs"}>
          No paths have been created.{" "}
          <EmptyStateActions>
            <Button variant={"link"}>Add a path</Button>
          </EmptyStateActions>
        </EmptyState>
      ) : (
        filtered && <EmptyState variant={"xs"}>No results found</EmptyState>
      )}
    </>
  );
}
