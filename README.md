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

There are multiple command-line options available:

```
$ yo channelape --help

  Usage:
    yo channelape [options]

  Options:
    --help          # Print the generator's options and usage
    --skip-cache    # Do not remember prompt answers                      Default: false
    --skip-install  # Do not automatically install dependencies           Default: false
    --org           # Publish to a GitHub organization account
    --coverage      # Add code coverage with nyc
    --codecov       # Upload coverage to codecov.io (implies --coverage)
    --channelape    # Specify that the generated repository is authored by ChannelApe, Inc.
    --open          # Opens the generated repository in a new vscode window.
```

The `--org` option takes a string value (i.e. `--org=avajs`). All others are boolean flags and can be negated with the `no` prefix (i.e. `--no-codecov`). You will be prompted for any options not passed on the command-line.
