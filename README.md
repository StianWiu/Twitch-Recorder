<p align='center'>
    <a href="https://github.com/StianWiu/Twitch-Recorder/actions/workflows/codeql-analysis.yml">
        <img alt="Github test" src="https://github.com/StianWiu/Twitch-Recorder/actions/workflows/codeql-analysis.yml/badge.svg">
    </a>
    <a href='https://www.npmjs.com/package/twitch-recorder'>
        <img src='https://img.shields.io/npm/v/twitch-recorder.svg' alt='Latest npm version'>
        <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/stianwiu/twitch-recorder">
        <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/stianwiu/twitch-recorder">
        <img alt="GitHub repo size" src="https://img.shields.io/github/repo-size/stianwiu/twitch-recorder">
        <img src='https://img.shields.io/npm/dm/twitch-recorder.svg' alt='Dependents'>
    </a>
</p>

# Install

```bash
$ npm i -g twitch-recorder
```

You can also install this without the -g but it will not be available globally.

# Options

| **Name**         | **Type**  | **Description**                      | **Input** | **Required** |
| ---------------- | --------- | ------------------------------------ | --------- | ------------ |
| `-h --help`      | `Extra`   | Display information about program.   |           | ☓            |
| `-u --user`      | `setting` | Specify what user to record          | `string ` | ✓            |
| `-c --category`  | `setting` | Chose specific category to record.   | `string ` | ☓            |
| `-m --max`       | `setting` | Control how large file can become    | `number ` | ☓            |
| `-l --loop`      | `setting` | Automatically wait for next stream   | `boolean` | ☓            |
| `-d --directory` | `setting` | Chose what directory to save to      | `string ` | ☓            |
| `-q --quality`   | `setting` | What quality to record. 0 is highest | `num `    | ☓            |

# Example commands

```bash
$ twitchrec -u <username>

$ twitchrec -u <username> -c <category> -m <num> -l -d <path> -q <num>

$ twitchrec --user <username> --category <category> --max <num> --loop --directory <path> --quality <num>
```

# Issues

If you are experiencing issues please open an issue on [GitHub](https://github.com/StianWiu/Twitch-recorder/issues) and I'll do my best to help you.

# Features

- Record only certain categories
- Record until certain file size has been reached
- Continue waiting for next stream after stream is done
- Choose what quality to record.

This was made for windows and ubuntu so it has not been tested in any other operating system. Though it will most likely still work. Please see [Requirements](#requirements) section.

Feel free to take as much as you want from this project and use it on your own.

# Requirements

- For both windows and Linux you need [Node.js](https://nodejs.org/) and [NPM](https://nodejs.org/) installed.

# Build Setup

```bash
# clone repo
$ git clone https://github.com/StianWiu/Twitch-Recorder/

# install dependencies
$ npm i

# start project with node
$ node index.js --user pignuuuu

# To see all options run
$ node index.js --help
```
