import {
  Button,
  Label,
  LabelGroup,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  Tooltip,
} from "@patternfly/react-core";
import { UndoRedo } from "./UndoRedo.tsx";
import { OpenApiEditorMachineContext } from "../OpenApiEditor.tsx";
import { groupBy } from "lodash";
import {
  ArrowLeftIcon,
  ErrorCircleOIcon,
  InfoIcon,
  WarningTriangleIcon,
} from "@patternfly/react-icons";
import { ReactNode } from "react";

export type EditorToolbarView = "design" | "code" | "visualize" | "hidden";
export type EditorToolbarProps = {
  title: ReactNode;
  label?: ReactNode;
  view: EditorToolbarView;
  canGoBack: boolean;
  onBack: () => void;
  onViewChange: (view: EditorToolbarView) => void;
};
export function EditorToolbar({
  title,
  label,
  view,
  canGoBack,
  onBack,
  onViewChange,
}: EditorToolbarProps) {
  const { low, medium, high } = OpenApiEditorMachineContext.useSelector(
    ({ context }) => {
      const groupedCount = groupBy(
        context.validationProblems,
        (v) => v.severity
      );
      return {
        low: groupedCount["info"]?.length ?? 0,
        medium: groupedCount["warning"]?.length ?? 0,
        high: groupedCount["danger"]?.length ?? 0,
      };
    }
  );
  const actorRef = OpenApiEditorMachineContext.useActorRef();
  return (
    <Toolbar className="pf-v6-u-p-0">
      <ToolbarContent>
        <ToolbarGroup>
          {canGoBack && (
            <ToolbarItem>
              <Button
                icon={<ArrowLeftIcon />}
                onClick={onBack}
                variant={"plain"}
              />
            </ToolbarItem>
          )}
          {label && <ToolbarItem alignSelf={"center"}>{label}</ToolbarItem>}
          <ToolbarItem style={{ flex: "1" }} alignSelf={"center"}>
            <Title headingLevel={"h1"} size={"lg"}>
              {title}
            </Title>
          </ToolbarItem>
          {low + medium + high > 0 && (
            <>
              <ToolbarItem alignSelf={"center"} variant={"label"}>
                <Tooltip content={`${low + medium + high} errors`}>
                  <Button
                    variant={"plain"}
                    onClick={() => {
                      actorRef.send({
                        type: "SELECT_VALIDATION",
                      });
                    }}
                  >
                    <LabelGroup>
                      {low !== 0 && (
                        <Label color={"blue"} icon={<InfoIcon />}>
                          {low}
                        </Label>
                      )}
                      {medium !== 0 && (
                        <Label color={"yellow"} icon={<WarningTriangleIcon />}>
                          {medium}
                        </Label>
                      )}
                      {high !== 0 && (
                        <Label color={"red"} icon={<ErrorCircleOIcon />}>
                          {high}
                        </Label>
                      )}
                    </LabelGroup>
                  </Button>
                </Tooltip>
              </ToolbarItem>
            </>
          )}
        </ToolbarGroup>
        <ToolbarGroup align={{ lg: "alignEnd" }} style={{ maxWidth: "30%" }}>
          <ToolbarItem>
            <UndoRedo />
          </ToolbarItem>
          {view !== "hidden" && (
            <>
              <ToolbarItem variant={"separator"} />
              <ToolbarItem>
                <ToggleGroup aria-label="View selector">
                  <ToggleGroupItem
                    text="Visualize"
                    buttonId="toggle-visualize"
                    isSelected={view === "visualize"}
                    onChange={() => {
                      onViewChange("visualize");
                    }}
                  />
                  <ToggleGroupItem
                    text="Design"
                    buttonId="toggle-designer"
                    isSelected={view === "design"}
                    onChange={() => {
                      onViewChange("design");
                    }}
                  />
                  <ToggleGroupItem
                    text="Source"
                    buttonId="toggle-yaml"
                    isSelected={view === "code"}
                    onChange={() => {
                      onViewChange("code");
                    }}
                  />
                </ToggleGroup>
              </ToolbarItem>
            </>
          )}
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );
}
