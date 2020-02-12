# TypeORM Benchmarks

This project is a boilerplate to measure and compare queries performance.

## run this project

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `ormconfig.json` file
3. Run `npm start` command

## Results

```
[
  PerformanceEntry {
    name: 'simple-education-query',
    entryType: 'measure',
    startTime: 2113.842862,
    duration: 6484.202455
  },
  PerformanceEntry {
    name: 'simple-user-query',
    entryType: 'measure',
    startTime: 2117.102796,
    duration: 6399.785908
  },
  PerformanceEntry {
    name: 'join-query',
    entryType: 'measure',
    startTime: 2117.56726,
    duration: 12433.768836
  }
]
```
