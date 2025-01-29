import { Denops } from "jsr:@denops/std@7.4.0";
import { assert, is } from "jsr:@core/unknownutil@4.3.0";
import { toTransformStream } from "jsr:@std/streams@1.0.8/to-transform-stream";
import { fromIni } from "npm:@aws-sdk/credential-providers@3.734.0";
import { ProcessorFactory } from "jsr:@omochice/tataku-vim@1.1.0";
import {
  BedrockRuntimeClient,
  type ConverseCommandInput,
  ConverseStreamCommand,
  type Message,
} from "npm:@aws-sdk/client-bedrock-runtime@3.734.0";

const isOption = is.ObjectOf({
  model: is.String,
  region: is.String,
  profile: is.String,
});

const processor: ProcessorFactory = async (
  _: Denops,
  option: unknown,
) => {
  assert(option, isOption);
  const credentials = await fromIni({
    profile: option.profile,
  })();
  const model = new BedrockRuntimeClient({
    region: option.region,
    endpoint: `https://bedrock-runtime.${option.region}.amazonaws.com`,
    credentials,
  });
  return toTransformStream(async function* (src: ReadableStream<string[]>) {
    for await (const chunk of src) {
      const messages = chunk.map((text, i): Message => ({
        role: i % 2 === 0 ? "user" : "assistant",
        content: [{ text }],
      }));
      const input: ConverseCommandInput = {
        modelId: option.model,
        messages,
      };
      const command = new ConverseStreamCommand(input);
      const response = await model.send(command);

      if (response.stream) {
        for await (const chunk of response.stream) {
          if (chunk.contentBlockDelta?.delta?.text) {
            yield [chunk.contentBlockDelta.delta.text];
          }
        }
      }
    }
  });
};

export default processor;
