import * as Rete from "rete";
import ReactRenderPlugin from 'rete-react-render-plugin';
import AreaPlugin from 'rete-area-plugin';
import ConnectionPlugin from 'rete-connection-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';
import HistoryPlugin from 'rete-history-plugin';
import { init } from "json-node-editor";
import './app.scss';


var numSocket = new Rete.Socket("Number value");

class NumControl extends Rete.Control {
  emitter: Rete.NodeEditor;
  props: {
    readonly: boolean;
    value: any;
    onChange: (value: any) => void;
  };
  update?: () => void;
  component: any;

  static component = ({ value, onChange }) => (
    <input
      type="number"
      value={value}
      ref={(ref) => {
        ref && ref.addEventListener("pointerdown", (e) => e.stopPropagation());
      }}
      onChange={(e) => onChange(+e.target.value)}
    />
  );

  constructor(
    emitter: Rete.NodeEditor,
    key: string,
    node: Rete.Node,
    readonly = false
  ) {
    super(key);
    this.emitter = emitter;
    this.key = key;
    this.component = NumControl.component;

    const initial = node.data[key] || 0;

    node.data[key] = initial;
    this.props = {
      readonly,
      value: initial,
      onChange: (v) => {
        this.setValue(v);
        this.emitter.trigger("process");
      },
    };
  }

  setValue(val: any) {
    this.props.value = val;
    this.putData(this.key, val);
    this.update && this.update();
  }
}

class NumComponent extends Rete.Component {
  constructor() {
    super("Test Number");
  }

  builder(node) {
    var out1 = new Rete.Output("num", "Number", numSocket);
    var ctrl = new NumControl(this.editor, "num", node);

    return node.addControl(ctrl).addOutput(out1);
  }

  worker(node, inputs, outputs) {
    outputs["num"] = node.data.num;
  }
}

class AddComponent extends Rete.Component {
  constructor() {
    super("Test Add");
  }

  builder(node) {
    var inp1 = new Rete.Input("num1", "Number", numSocket);
    var inp2 = new Rete.Input("num2", "Number2", numSocket);
    var out = new Rete.Output("num", "Number", numSocket);

    inp1.addControl(new NumControl(this.editor, "num1", node));
    inp2.addControl(new NumControl(this.editor, "num2", node));

    return node
      .addInput(inp1)
      .addInput(inp2)
      .addControl(new NumControl(this.editor, "preview", node, true))
      .addOutput(out);
  }

  worker(node, inputs, outputs) {
    var n1 = inputs["num1"].length ? inputs["num1"][0] : node.data.num1;
    var n2 = inputs["num2"].length ? inputs["num2"][0] : node.data.num2;
    var sum = n1 + n2;

    let ctrl = this.editor.nodes
      .find((n) => n.id == node.id)
      .controls.get("preview") as NumControl;
    ctrl.setValue(sum);
    outputs["num"] = sum;
  }
}



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

export async function createEditor(container: HTMLElement) {
  
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
  init(sampleDefs, editor as any, engine as any);
  [new NumComponent(), new AddComponent()].forEach(c => {
    editor.register(c);
    engine.register(c);
  })

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
    return null;
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
