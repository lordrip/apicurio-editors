import { Toc } from "../components/Toc.tsx";
import { TocContainer } from "../components/TocContainer.tsx";
import { JumpLinksItem } from "@patternfly/react-core";
import { Section } from "../components/Section.tsx";
import { Info } from "./Info.tsx";
import { NodeHeader } from "../components/NodeHeader.tsx";
import { useMachineSelector } from "./DataTypeDesignerMachineContext.ts";

export function Designer() {
  const { dataType } = useMachineSelector(({ context }) => {
    return {
      dataType: context.dataType,
    };
  });
  return (
    <>
      <NodeHeader title={dataType.name} view={"designer"} isClosable={true} />

      <Toc>
        <JumpLinksItem href="#info">Info</JumpLinksItem>
      </Toc>
      <TocContainer>
        <Section title={"Info"} id={"info"}>
          <Info />
        </Section>
      </TocContainer>
    </>
  );
}