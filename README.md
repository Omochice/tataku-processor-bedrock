# tataku-processor-bedrock

The processor module using bedrock.

## Contents

- [Dependencies](tataku-processor-bedrock-dependencies)
- [Options](tataku-processor-bedrock-options)
- [Samples](tataku-processor-bedrock-samples)

## Dependencies

This plugin needs:

- [denops.vim](https://github.com/vim-denops/denops.vim)
- [tataku.vim](https://github.com/Omochice/tataku.vim)

## Options

This module has some options.

```typescript
type Option = {
  model: string;
  region: string;
  profile: string;
  systemPrompt?: string;
};
```

- `model`

  Model name. Specified model is needed to be installed.
- `region`

  Region name.
- `profile`

  Profile name for loading `.aws/config`.
- `systemPrompt`

  System prompt for the model.

## Samples

```vim
let g:tataku_recipes = #{
  \   sample: #{
  \     processor: #{
  \       name: 'bedrock',
  \       options: #{
  \         model: 'anthropic.claude-3-sonnet-20240229-v1:0',
  \         region: 'us-east-1',
  \         profile: 'sample-profile',
  \       },
  \     }
  \   }
  \ }
```
