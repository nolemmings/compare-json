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
      <td>Show help.</td>
    </tr>
    <tr>
      <td>--separator</td>
      <td>-s</td>
      <td>Separates files into different groups using a separator string. The separator string will be the last occurrence within the filepath.
      <br /><br />
      For example, assume the files <code>user-en.json, user-nl.json, register-en.json, register-nl.json</code>; this command creates two comparison groups: <code>comparejson -s="-" ./*.json</code>.</td>
    </tr>
    <tr>
      <td>--groupBy</td>
      <td>-g</td>
      <td>Separates files into different groups using a regex pattern. Only files within the same group are compared to one another.
      <br /><br />
      For example, assume the files <code>user-en.json, user-nl.json, register-en.json, register-nl.json</code>; this command creates two comparison groups: <code>comparejson -g="(.+)\-.[^\/]+.*" ./*.json</code>. Please not that this particular example can be achieved easier using the <code>--separator</code> option.</td>
    </tr>
    <tr>
      <td>--ignoreUngrouped</td>
      <td>-i</td>
      <td>When using <code>--groupBy</code> or <code>--separator</code> all files not matching any group will be ignored by default. To change this behaviour and group all unmatched groups in one single group use <code>-i=false</code>.</td>
    </tr>
  </tbody>
</table>
