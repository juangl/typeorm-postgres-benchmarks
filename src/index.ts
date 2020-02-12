import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import { User } from "./entity/User";
import { Education } from "./entity/Education";
import { performance, PerformanceObserver } from "perf_hooks";

function asyncTimify<T extends any[], R>(fn: (...args: T) => R, markName) {
  return async function timifyWrapper(...args: T): Promise<R> {
    performance.mark(`${markName}-start`);
    const result = await fn(...args);
    performance.mark(`${markName}-end`);
    return result;
  };
}

function measure(markName) {
  performance.measure(markName, `${markName}-start`, `${markName}-end`);
}

const ITERATIONS = 1000;

const joinQueryMarkName = "join-query";
const simpleEducationQueryMarkName = "simple-education-query";
const simpleUserQueryMarkName = "simple-user-query";

async function joinQuery(userId, connection: Connection) {
  const userRepository = connection.getRepository(User);

  for (let i = 0; i < ITERATIONS; i++) {
    await userRepository.findOne({
      where: { id: userId },
      relations: ["education"],
    });
  }
}

async function simpleEducationQuery(userId, connection: Connection) {
  const educationRepository = connection.getRepository(Education);
  for (let i = 0; i < ITERATIONS; i++) {
    await educationRepository.findOne({
      where: {
        userId,
      },
    });
  }
}

async function simpleUserQuery(userId, connection: Connection) {
  const userRepository = connection.getRepository(User);
  for (let i = 0; i < ITERATIONS; i++) {
    await userRepository.findOne({
      where: {
        id: userId,
      },
    });
  }
}

createConnection()
  .then(async connection => {
    const obs = new PerformanceObserver((list, observer) => {
      console.log("Result  ============>\n", list.getEntries());
    });
    obs.observe({ entryTypes: ["measure"], buffered: true });

    console.log("Inserting a new user into the database...");
    const user = new User();
    await user.save();
    const userId = user.id;
    console.log("Saved a new user with id: " + userId);
    const education = new Education();
    education.user = user;
    await education.save();
    console.log("Save a new education with id:" + education.id);

    const educationResult = asyncTimify(
      simpleEducationQuery,
      simpleEducationQueryMarkName,
    )(userId, connection);

    const userResult = asyncTimify(simpleUserQuery, simpleUserQueryMarkName)(
      userId,
      connection,
    );

    const joinResult = asyncTimify(joinQuery, joinQueryMarkName)(
      userId,
      connection,
    );

    await Promise.all([educationResult, userResult, joinResult]);

    measure(joinQueryMarkName);
    measure(simpleEducationQueryMarkName);
    measure(simpleUserQueryMarkName);
  })
  .catch(error => console.log(error));
