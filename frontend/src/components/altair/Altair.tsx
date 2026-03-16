/**
 * Altair — handles the render_altair tool call and renders vega charts.
 * Config/model setup is handled by Brain.tsx — this component only renders charts.
 */
import { useEffect, useRef, useState, memo } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { FunctionDeclaration, LiveServerToolCall, Type } from "@google/genai";

export const RENDER_ALTAIR_DECLARATION: FunctionDeclaration = {
  name: "render_altair",
  description: "Displays an altair graph in json format.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      json_graph: {
        type: Type.STRING,
        description:
          "JSON STRING representation of the graph to render. Must be a string, not a json object",
      },
    },
    required: ["json_graph"],
  },
};

function AltairComponent() {
  const [jsonString, setJSONString] = useState<string>("");
  const { client } = useLiveAPIContext();

  useEffect(() => {
    const onToolCall = (toolCall: LiveServerToolCall) => {
      const fc = toolCall.functionCalls?.find(
        (fc) => fc.name === "render_altair"
      );
      if (!fc) return;
      setJSONString((fc.args as any).json_graph);
      setTimeout(() =>
        client.sendToolResponse({
          functionResponses: [
            { response: { output: { success: true } }, id: fc.id, name: fc.name },
          ],
        }), 200
      );
    };
    client.on("toolcall", onToolCall);
    return () => { client.off("toolcall", onToolCall); };
  }, [client]);

  const embedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (embedRef.current && jsonString) {
      vegaEmbed(embedRef.current, JSON.parse(jsonString));
    }
  }, [embedRef, jsonString]);

  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);
