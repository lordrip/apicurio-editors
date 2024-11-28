import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { InlineEdit } from "../components/InlineEdit.tsx";
import {
  useMachineActorRef,
  useMachineSelector,
} from "./PathDesignerMachineContext.ts";

export function Info() {
  const { summary, description, editable } = useMachineSelector(
    ({ context }) => {
      return {
        summary: context.summary,
        description: context.description,
        editable: context.editable,
      };
    },
  );
  const actorRef = useMachineActorRef();
  return (
    <DescriptionList>
      <DescriptionListGroup>
        <DescriptionListTerm>Summary</DescriptionListTerm>
        <DescriptionListDescription>
          <InlineEdit
            onChange={(summary) => {
              actorRef.send({ type: "CHANGE_SUMMARY", summary });
            }}
            value={summary}
            editing={editable}
          />
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Description</DescriptionListTerm>
        <DescriptionListDescription>
          <InlineEdit
            onChange={(description) => {
              actorRef.send({ type: "CHANGE_DESCRIPTION", description });
            }}
            value={description}
            editing={editable}
          />
        </DescriptionListDescription>
      </DescriptionListGroup>
    </DescriptionList>
  );
}
