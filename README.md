# compare-json

Compares two or more JSON files and detects which keys are missing.

## Install

```
npm install -g compare-json
```

## Run

When installed you can run the `comparejson` command from your command line.

For example:

```
$ comparejson ./test/fixture/*.json
```

![Result screenshot](https://github.com/nolemmings/compare-json/blob/master/screenshot.png?raw=true)

## Options

For options, you can also run help `$ comparejson --help`

<table>
  <thead>
    <tr>
      <th width="25%">Flag</th>
      <th width="15%">Short Flag</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>--help</td>
      <td></td>
      <td>Show this help.</td>
    </tr>
    <tr>
      <td>--separator</td>
      <td>-s</td>
      <td>Separates files into different groups using a separator string. The separator string will be the last occurrence within the filepath.

      For example, assume the files `user-en.json, user-nl.json, register-en.json, register-nl.json`; the following command will create two comparison groups: `comparejson -s="-" ./*.json`.</td>
    </tr>
    <tr>
      <td>--groupBy</td>
      <td>-g</td>
      <td>Separates files into different groups using a regex pattern. Only files within the same group are compared to one another.

      For example, assume the files `user-en.json, user-nl.json, register-en.json, register-nl.json`; the following command will create two comparison groups: `comparejson -g="(.+)\-.[^\/]+.*" ./*.json`. This particular example can be achieved easier using the `--separator` option.</td>
    </tr>
    <tr>
      <td>--ignoreUngrouped</td>
      <td>-i</td>
      <td>When using `--groupBy` or `--separator` by default all files not matching any group will be ignored. If you want to treat all files not matching any group as part of one separate group set `-i=false`.</td>
    </tr>
  </tbody>
</table>
