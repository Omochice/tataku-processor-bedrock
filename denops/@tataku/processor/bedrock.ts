import "npm:@smithy/eventstream-codec@^2.0.5";

import { Denops } from "jsr:@denops/std@7.4.0";
import { assert, is } from "jsr:@core/unknownutil@4.3.0";
import { toTransformStream } from "jsr:@std/streams@1.0.8/to-transform-stream";
import { BedrockChat } from "npm:@langchain/community@0.2.21/chat_models/bedrock/web";
import { fromIni } from "npm:@aws-sdk/credential-providers@3.734.0";
import { HumanMessage } from "npm:@langchain/core@0.3.36/messages";
import { ProcessorFactory } from "jsr:@omochice/tataku-vim@1.1.0";

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
  const { accessKeyId, secretAccessKey, sessionToken } = await fromIni({
    profile: option.profile,
  })();
  const model = new BedrockChat({
    model: option.model,
    region: option.region,
    credentials: {
      accessKeyId,
      secretAccessKey,
      sessionToken,
    },
  });
  return toTransformStream(async function* (src: ReadableStream<string[]>) {
    for await (const chunk of src) {
      const response = await model.stream([
        new HumanMessage({ content: chunk.join("") }),
      ]);
      for await (const r of response) {
        yield [r.content.toString()];
      }
    }
  });
};

export default processor;
