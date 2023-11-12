import React from "react";
import interact from "interactjs";

import "./Engine";

export const Game = () => {
  interact("#game").gesturable({
    onstart: () => {},
    onend: () => {},
  });

  return <div id="game">test</div>;
};
