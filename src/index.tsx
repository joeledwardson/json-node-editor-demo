import React, { useEffect, useState, RefObject, createRef } from "react";
import ReactDOM from "react-dom";
import { createEditor } from "./rete";

function Editor() {
  const divRef = createRef<HTMLInputElement>();

  useEffect(() => {
    if (divRef.current) {
      createEditor(divRef.current);
    } else {
      throw new Error("div ref not initialized!");
    }
  });

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
      }}
      ref={divRef}
    />
  );
}



const rootElement = document.getElementById("root");
ReactDOM.render(<Editor />, rootElement);
