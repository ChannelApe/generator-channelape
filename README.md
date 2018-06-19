# generator-channelape

Scaffold Node TypeScript Web Application to accept webhooks from [ChannelApe](https://www.channelape.com/).

## Install

```
$ npm install --global yo generator-channelape
```


## Usage

With [yo](https://github.com/yeoman/yo):

```
$ yo channelape
```
The following is an example of an advanced command:
```bash
$ yo channelape api-key-123 --open --staging --channelape
```
It will:
1. Create a new repository and base project in your current directory.
1. Put `api-key-123` in your `.env` and `.env.example` files
1. Open the current directory in VSCode.
1. Prepare your `.env` and `.env.example` files for use with the ChannelApe staging environment
1. Prepare your package authorship to be `ChannelApe` with your current git name and email set as a contributor.
1. Install NPM dependencies in the newly generated project.


There are multiple command-line options available:

```
$ yo channelape --help

  Usage:
  yo channelape:app [options] [<channelApeApiKey>]

Options:
  -h,    --help          # Print the generator's options and usage
         --skip-cache    # Do not remember prompt answers                                                  Default: false
         --skip-install  # Do not automatically install dependencies                                       Default: false
  -ca,   --channelape    # This is a private module owned by ChannelApe
  -o,    --open          # Open the repository in VSCode
  -s,    --staging       # Prep the environment variables for use with the ChannelApe staging environment

Arguments:
  channelApeApiKey  # The key used to access the ChannelApe API  Type: String  Required: false
```

The `--org` option takes a string value (i.e. `--org=avajs`). All others are boolean flags and can be negated with the `no` prefix (i.e. `--no-codecov`). You will be prompted for any options not passed on the command-line.
