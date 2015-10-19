# compare-json

Compares two or more JSON files and detects which keys are missing.

## Install

```
npm install -g compare-json
```

## Run

When installed globally run the `comparejson` command from your command line:

```
$ comparejson ./test/*.json

test/test1.json is missing the following keys:
- c
test/test2.json is complete
test/test3.json is missing the following keys:
- a.a1.a1a
- a.a1.a1b
- a.a2.a2a
- b
```

## Options

For options, simply run help:

```
$ comparejson --help
```
