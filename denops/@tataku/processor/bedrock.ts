import { Denops } from "jsr:@denops/std@7.5.0";
import { as, assert, is } from "jsr:@core/unknownutil@4.3.0";
import { fromIni } from "npm:@aws-sdk/credential-providers@3.787.0";
import { ProcessorFactory } from "jsr:@omochice/tataku-vim@1.2.1";
import {
  BedrockRuntimeClient,
  type ConverseCommandInput,
  ConverseStreamCommand,
  type Message,
} from "npm:@aws-sdk/client-bedrock-runtime@3.787.0";

const isOption = is.ObjectOf({
  model: is.String,
  region: is.String,
  profile: is.String,
  systemPrompt: as.Optional(is.String),
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
  return new TransformStream<string[]>({
    transform: async (chunk, controller) => {
      const messages = chunk.map((text, i): Message => ({
        role: i % 2 === 0 ? "user" : "assistant",
        content: [{ text }],
      }));
      const input: ConverseCommandInput = {
        modelId: option.model,
        messages,
        system: option.systemPrompt
          ? [{ text: option.systemPrompt }]
          : undefined,
      };
      const command = new ConverseStreamCommand(input);
      const response = await model.send<
        ConverseCommandInput,
        typeof ConverseStreamCommand["__types"]["sdk"]["output"]
      >(
        command,
      );
      if (response.stream == null) {
        return;
      }
      for await (const chunk of response.stream) {
        if (chunk.contentBlockDelta?.delta?.text) {
          controller.enqueue([chunk.contentBlockDelta.delta.text]);
        }
      }
    },
  });
};

export default processor;
