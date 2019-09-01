import * as React from "react";
import { render } from "react-dom";

import "./styles.css";
import { Panel, PanelItem, PanelSplitter } from "./Panel";

function App() {
  //root element behaves like a default horizontal panel
  return (
    <PanelItem fill={1} align="stretch">
      <Panel direction="vertical">
        <PanelItem>
          <Panel
            direction="horizontal"
            leftOverSpace="start"
            padding={[0.25, 1]}
            spacingBetweenItems={1}
            border={[0, 0, 2, 0]}
            borderStyle="dashed"
            borderColor="red"
          >
            <PanelItem>btn 1</PanelItem>
            <PanelItem>btn 2</PanelItem>
            <PanelItem>btn 3</PanelItem>
            <PanelItem>btn 4</PanelItem>
          </Panel>
        </PanelItem>
        <PanelItem>
          <Panel direction="horizontal" spacingBetweenItems={1}>
            <PanelItem>
              text line 1<br />
              text line 2
            </PanelItem>
            <PanelItem>single line</PanelItem>
            <PanelItem fill={1} />
            <PanelItem align="stretch" width={3} background="blue" />
          </Panel>
        </PanelItem>
        <PanelItem fill={1}>
          <Panel
            direction="horizontal"
            alignItems="stretch"
            padding={0.5}
            spacingBetweenItems={1}
          >
            <PanelItem>
              <Panel direction="vertical">
                <PanelItem align="start" padding={[0.5, 1]}>
                  Header
                </PanelItem>
                <PanelSplitter background="lightgray" />
                <PanelItem fill={1}>
                  {Array.from({ length: 100 }).map((_, i) => (
                    <div>{"content line with some long text " + (i + 1)}</div>
                  ))}
                </PanelItem>
                <PanelItem>Footer</PanelItem>
              </Panel>
            </PanelItem>
            <PanelSplitter />
            <PanelItem fill={1}>
              <Panel direction="vertical">
                <PanelItem align="start" height={2}>
                  Header
                </PanelItem>
                <PanelItem fill={1}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div>{"content line with some long text " + (i + 1)}</div>
                  ))}
                </PanelItem>
                <PanelItem>Footer</PanelItem>
              </Panel>
            </PanelItem>
            <PanelSplitter resize="next" />
            <PanelItem fill={1}>
              <Panel direction="vertical">
                <PanelItem align="start">Header</PanelItem>
                <PanelItem fill={1}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div>{"content line with some long text " + (i + 1)}</div>
                  ))}
                </PanelItem>
                <PanelItem>Footer</PanelItem>
              </Panel>
            </PanelItem>
          </Panel>
        </PanelItem>
      </Panel>
    </PanelItem>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
