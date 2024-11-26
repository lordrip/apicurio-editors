import {
  Accordion,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DataList,
  DataListCell,
  DataListContent,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DataListToggle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
  SearchInput,
  Split,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import { OpenApiEditorMachineContext } from "../OpenApiEditor.tsx";
import { DocumentPath, Operation, Operations } from "../OpenApiEditorModels.ts";
import { useMachineSelector } from "./DocumentDesignerMachineContext.ts";
import { Markdown } from "../components/Markdown.tsx";
import { Path } from "../components/Path.tsx";
import { TagLabel } from "../components/TagLabel.tsx";
import { assign, setup } from "xstate";
import { useMachine } from "@xstate/react";
import { SectionSkeleton } from "../components/SectionSkeleton.tsx";
import { useState } from "react";
import { OperationLabel } from "./OperationLabel.tsx";
import { StatusCodeLabel } from "../components/StatusCodeLabel.tsx";
import { AccordionSection } from "../components/AccordionSection.tsx";

function normalize(str: string) {
  return str.toLowerCase().trim().normalize("NFC");
}

function isMatch(filter: string, someString?: string) {
  if (!someString) {
    return false;
  }
  return normalize(someString).includes(filter);
}

const machine = setup({
  types: {
    context: {} as {
      paths: DocumentPath[];
      initialPaths: DocumentPath[];
      filter: string;
    },
    events: {} as { readonly type: "SEARCH"; filter: string },
    input: {} as {
      paths: DocumentPath[];
    },
  },
}).createMachine({
  id: "pathsExplorer",
  context: ({ input }) => ({
    paths: input.paths,
    initialPaths: input.paths,
    filter: "",
  }),
  initial: "idle",
  states: {
    idle: {
      entry: assign({
        paths: ({ context: { initialPaths } }) => initialPaths,
      }),
    },
    filtered: {
      entry: assign({
        paths: ({ context: { initialPaths, filter } }) => {
          const normalizedFilter = normalize(filter);
          return initialPaths.filter(
            (path) =>
              isMatch(normalizedFilter, path.node.path) ||
              isMatch(normalizedFilter, path.description) ||
              isMatch(normalizedFilter, path.summary) ||
              Operations.reduce(
                (found, operation) =>
                  found ||
                  isMatch(
                    normalizedFilter,
                    path.operations[operation]?.description
                  ) ||
                  isMatch(
                    normalizedFilter,
                    path.operations[operation]?.summary
                  ),
                false
              )
          );
        },
      }),
    },
    debouncing: {
      after: {
        200: [
          {
            target: "filtered",
            guard: ({ context: { filter } }) => filter.length > 0,
          },
          {
            target: "idle",
          },
        ],
      },
    },
  },
  on: {
    SEARCH: {
      target: ".debouncing",
      actions: assign({ filter: ({ event }) => event.filter }),
      reenter: true,
    },
  },
});

export function PathsExplorer() {
  const { allPaths } = useMachineSelector(({ context }) => {
    return {
      allPaths: context.paths,
    };
  });
  const [state, send] = useMachine(machine, {
    input: {
      paths: allPaths,
    },
  });

  return (
    <Stack hasGutter={true}>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
            <SearchInput
              onChange={(_, filter) => send({ type: "SEARCH", filter })}
              onClear={() => send({ type: "SEARCH", filter: "" })}
              value={state.context.filter}
              placeholder={"Find anywhere"}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      {(() => {
        switch (state.value) {
          case "debouncing":
            return <SectionSkeleton />;
          case "idle":
          case "filtered":
            return state.context.paths.map((path) => (
              <PathDetails
                path={path}
                key={path.node.path}
                searchTerm={state.context.filter}
                forceExpand={state.value === "filtered"}
              />
            ));
        }
      })()}
    </Stack>
  );
}

function PathDetails({
  path,
  searchTerm,
  forceExpand,
}: {
  path: DocumentPath;
  searchTerm?: string;
  forceExpand?: boolean;
}) {
  const actorRef = OpenApiEditorMachineContext.useActorRef();
  return (
    <Card isCompact={true} isClickable={true} isPlain={true}>
      <CardHeader
        selectableActions={{
          onClickAction: () =>
            actorRef.send({
              type: "SELECT_PATH_VISUALIZER",
              path: path.node.path,
              nodePath: path.node.nodePath,
            }),
          selectableActionAriaLabelledby: `path-title-${path.node.nodePath}`,
        }}
      >
        <CardTitle id={`path-title-${path.node.nodePath}`}>
          <Path path={path.node.path} />
        </CardTitle>
      </CardHeader>
      {path.summary && (
        <CardBody>
          <Markdown searchTerm={searchTerm}>{path.summary}</Markdown>
        </CardBody>
      )}
      <CardBody>
        <DataList aria-label={"Path operations"}>
          {Operations.map((opName) => {
            const o = path.operations[opName];
            if (o !== undefined) {
              return (
                <OperationRow
                  key={opName}
                  operation={o}
                  pathId={path.node.nodePath}
                  name={opName}
                  searchTerm={searchTerm}
                  forceExpand={forceExpand}
                />
              );
            }
          })}
        </DataList>
      </CardBody>
    </Card>
  );
}

function OperationRow({
  operation,
  pathId,
  name,
  searchTerm,
  forceExpand,
}: {
  operation: Operation;
  pathId: string;
  name: (typeof Operations)[number];
  searchTerm?: string;
  forceExpand?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isExpanded = forceExpand || expanded;
  return (
    <DataListItem
      aria-labelledby={`path-${pathId}-operation-${name}`}
      isExpanded={isExpanded}
    >
      <DataListItemRow>
        <DataListToggle
          onClick={() => setExpanded((v) => !v)}
          isExpanded={isExpanded}
          id={`path-${pathId}-operation-${name}-toggle`}
          aria-controls={`path-${pathId}-operation-${name}-expand`}
        />
        <DataListItemCells
          dataListCells={[
            <DataListCell isFilled={false} key={"operation"}>
              <OperationLabel name={name} />
            </DataListCell>,
            <DataListCell key={"summary"}>
              <Markdown searchTerm={searchTerm}>{operation.summary}</Markdown>
            </DataListCell>,
            <DataListCell key={"tags"} isFilled={false}>
              <LabelGroup>
                {operation.tags.map((t) => (
                  <TagLabel key={t} name={t} />
                ))}
              </LabelGroup>
            </DataListCell>,
          ]}
        />
      </DataListItemRow>
      <DataListContent
        aria-label={"Path info"}
        hasNoPadding={true}
        id={`path-${pathId}-operation-${name}-expand`}
        isHidden={!isExpanded}
      >
        <Stack hasGutter={true}>
          {operation.description && (
            <Markdown searchTerm={searchTerm}>{operation.description}</Markdown>
          )}
          <Title headingLevel={"h4"}>Request</Title>
          <Accordion>
            {operation.pathParameters.length > 0 && (
              <AccordionSection
                title={"Path parameters"}
                id={"paths-params"}
                startExpanded={false}
                count={operation.pathParameters.length}
              >
                <DescriptionList isHorizontal={true}>
                  {operation.pathParameters.map((p, idx) => (
                    <DescriptionListGroup key={idx}>
                      <DescriptionListTerm>
                        <Stack hasGutter={true}>
                          {p.name}
                          {p.required && (
                            <StackItem>
                              <Label color={"blue"}>Required</Label>
                            </StackItem>
                          )}
                        </Stack>
                      </DescriptionListTerm>
                      <DescriptionListDescription>
                        <Stack hasGutter={true}>
                          {p.type}
                          {p.description && (
                            <StackItem>
                              <Markdown>{p.description}</Markdown>
                            </StackItem>
                          )}
                        </Stack>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  ))}
                </DescriptionList>
              </AccordionSection>
            )}
          </Accordion>
          <Title headingLevel={"h4"}>Responses</Title>
          <Accordion>
            {operation.responses.map((t) => (
              <AccordionSection
                title={
                  <Split hasGutter={true}>
                    <StatusCodeLabel code={t.statusCode} />
                    {t.description}
                  </Split>
                }
                id={`response-${t.statusCode}`}
                startExpanded={false}
              >
                TODO
              </AccordionSection>
            ))}
          </Accordion>
        </Stack>
      </DataListContent>
    </DataListItem>
  );
}
