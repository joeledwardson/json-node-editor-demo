import { useEffect, createRef, useState } from "react";
import * as Rete from 'rete';
import ReactDOM from "react-dom";
import Select from 'react-select';
import ReactRenderPlugin from 'rete-react-render-plugin';
import AreaPlugin from 'rete-area-plugin';
import ConnectionPlugin from 'rete-connection-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';
import HistoryPlugin from 'rete-history-plugin';
import { init, getJSONData } from "json-node-editor";
import './app.scss';


const sampleDefs = {
  "RFMvAvg": {
    "title": "RFMvAvg",
    "description": "moving average of parent values",
    "type": "object",
    "additionalProperties": false,
    "isClassDefinition": true,
    "required": ["cache_count"],
    "properties": {
      "custom_ftr_identifier": {
        "title": "Custom Ftr Identifier",
        "type": "string"
      },
      "cache_count": {
        "title": "Cache Count",
        "description": "number of caching points",
        "default": 2,
        "type": "integer"
      },
      "cache_secs": {
        "title": "Cache Secs",
        "type": "number"
      },
      "cache_insidewindow": {
        "title": "Cache Insidewindow",
        "type": "boolean"
      }
    }
  },
  'sample_dict': {
    "title": "hello",
    "required": "children",
    "properties": {
      "a": {
        "type": "object",
        "additionalProperties": {
          "type": "object",
          "additionalProperties": {
            "type": "integer"
          }
        }
      }
    }
  },
  "a": {
    "title": "A",
    "type": "object",
    "properties": {
      "a": {
        "title": "A",
        "anyOf": [
          {
            "type": "object",
            "additionalProperties": {
              "type": "integer"
            }
          },
          {
            "type": "object",
            "additionalProperties": {
              "type": "object",
              "additionalProperties": {
                "type": "string"
              }
            }
          }
        ]
      }
    },
    "required": [
      "a"
    ]
  },
  "C": {
    "title": "C",
    "type": "object",
    "properties": {
      "a": {
        "title": "A",
        "type": "object",
        "additionalProperties": {
          "anyOf": [
            {
              "type": "integer"
            },
            {
              "type": "string"
            }
          ]
        }
      },
      "b": {
        "title": "B",
        "type": "integer"
      }
    },
    "required": [
      "a",
      "b"
    ]
  },
  "e": {
    "title": "E",
    "type": "object",
    "properties": {
      "a": {
        "title": "A",
        "anyOf": [
          {
            "type": "object",
            "additionalProperties": {
              "anyOf": [
                {
                  "type": "integer"
                },
                {
                  "type": "string"
                }
              ]
            }
          },
          {
            "type": "object",
            "additionalProperties": {
              "type": "string"
            }
          },
          {
            "type": "integer"
          }
        ]
      },
      "b": {
        "title": "B",
        "type": "integer"
      }
    },
    "required": [
      "a",
      "b"
    ]
  },
  "hello": {
    "title": "Hello",
    "type": "object",
    "properties": {
        "name": {
            "title": "Name",
            "type": "string"
        },
        "another": {
            "title": "Another",
            "type": "string"
        },
        "pls": {
            "title": "Pls",
            "default": "hello",
            "type": "string"
        },
        "count": {
            "title": "Count",
            "type": "integer"
        },
        "seven": {
            "title": "Seven",
            "default": 7,
            "type": "integer"
        },
        "d": {
            "title": "D",
            "type": "object"
        }
    },
    "required": [
        "name",
        "count"
    ]
  },
  "numtest": {
      "title": "NumTest",
      "type": "object",
      "properties": {
          "a": {
              "title": "A",
              "type": "integer"
          },
          "b": {
              "title": "B",
              "anyOf": [
                  {
                      "type": "integer"
                  },
                  {
                      "type": "string"
                  }
              ]
          }
      },
      "required": [
          "a",
          "b"
      ]
  }
}

export async function createEditor(container: HTMLElement): Promise<Rete.NodeEditor> {
  
  // TODO - shift drag select not working
  console.log("creating editor...");
  var editor = new Rete.NodeEditor("demo@0.1.0", container);
  var engine = new Rete.Engine("demo@0.0.1");

  editor.use(ReactRenderPlugin);
  editor.use(AreaPlugin, {
    background: true, 
    snap: true,
    scaleExtent: {
      min: 0.5,
      max: 1,
    },
    translateExtent: { 
      width: 5000, 
      height: 4000 
    },
  });
  editor.use(ConnectionPlugin);
  editor.use(ContextMenuPlugin, {searchBar: true});
  editor.use(HistoryPlugin);
  init(sampleDefs, editor, engine);

  editor.on('process', () => {
    console.log('editor process');
  });

  editor.on(
    ["process", "nodecreated", "noderemoved", "connectioncreated", "connectionremoved"],
    async () => {
      console.log("editor change");
      // await engine.abort();
      // await engine.process(editor.toJSON());
    }
  );

  editor.on('error', (args: string | Error) => {
    console.log(`foun an error: ${args}`);
  })

  // disable zoom on double click
  editor.on('zoom', ({ source }) => {
      return source !== 'dblclick';
  });

  editor.view.resize();
  editor.trigger("process");
  AreaPlugin.zoomAt(editor, editor.nodes);
  console.log("finished creating editor...");

  return editor;
}



function Editor() {
  const divRef = createRef<HTMLInputElement>();
  const [editor, setEditor] = useState<Rete.NodeEditor | null>(null);
  const [nodeJSON, setNodeJSON] = useState<string>("");
  const [dataJSON, setDataJSON] = useState<string>("");
  const [display, setDisplay] = useState<string>("data");

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
          async () => {
            setNodeJSON(JSON.stringify(newEditor.toJSON(),null,4));
            setDataJSON(JSON.stringify(getJSONData(newEditor), null, 4));
          }
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
          <div>
            <Select 
              options={[
                {value: "editor", label:"Editor JSON"},
                {value: "data", label: "JSON Data"}
              ]} 
              defaultValue={{value: "data", label: "JSON Data"}}
              onChange={({value, label}) => setDisplay(value)}
            />
            <textarea 
              hidden={display!="editor"}
              className="text-json" 
              value={nodeJSON} 
              onChange={(event) => setNodeJSON(event.currentTarget.value)}
            ></textarea>
            <textarea 
              hidden={display!="data"}
              className="text-json" 
              value={dataJSON} 
              onChange={(event) => setDataJSON(event.currentTarget.value)}
            ></textarea>
          </div>
          
      </div>
      <div className="footer">pls</div>
    </div>
  );
}



const rootElement = document.getElementById("root");
ReactDOM.render(<Editor />, rootElement);
