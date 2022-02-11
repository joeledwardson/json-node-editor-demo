import { useEffect, createRef, useState } from "react";
import * as Rete from 'rete';
import ReactDOM from "react-dom";
import { createEditor } from "./app";
import { Col } from 'react-bootstrap';


function Editor() {
  const divRef = createRef<HTMLInputElement>();
  const [editor, setEditor] = useState<Rete.NodeEditor | null>(null);
  const [nodeJSON, setNodeJSON] = useState<string>("");

  useEffect(() => {
    // check div ref exists and editor not initialised
    if (divRef.current && !editor) {
      // create editor
      createEditor(divRef.current).then((newEditor: Rete.NodeEditor) => {
        // assign to state
        setEditor(newEditor);
        // log editor JSON change
        newEditor.on(
          ["process", "nodecreated", "noderemoved", "connectioncreated", "connectionremoved"],
          async () => setNodeJSON(JSON.stringify(newEditor.toJSON(),null,4))
        );
      });
    }
  });

  return (
    <div className="root-container">
      <div>
        <h1><code>JSON</code> Node Editor Demo</h1>
      </div>
      <div className="content-container">
          <div ref={divRef} style={{maxWidth: "50%"}}></div>
          <textarea 
            className="text-json" 
            value={nodeJSON} 
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setNodeJSON(event.currentTarget.value)}
          ></textarea>
      </div>
      <div className="footer">pls</div>
    </div>
  );
}



const rootElement = document.getElementById("root");
ReactDOM.render(<Editor />, rootElement);
