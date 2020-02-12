import "reflect-metadata";
import { createConnection, Connection } from "typeorm";
import { User } from "./entity/User";
import { Education } from "./entity/Education";
import { performance, PerformanceObserver } from "perf_hooks";

const ITERATIONS = 1000;

const markNameJoinQueryStart = "join-query-start";
const markNameJoinQueryEnd = "join-query-end";

const markNameSimpleQueryStart = "simple-query-start";
const markNameSimpleQueryEnd = "simple-query-end";

async function joinQuery(userId, connection: Connection) {
  const userRepository = connection.getRepository(User);

  performance.mark(markNameJoinQueryStart);
  for (let i = 0; i < ITERATIONS; i++) {
    await userRepository.findOne({
      where: { id: userId },
      relations: ["education"],
    });
  }
  performance.mark(markNameJoinQueryEnd);
}

async function simpleQuery(userId, connection: Connection) {
  const educationRepository = connection.getRepository(Education);
  performance.mark(markNameSimpleQueryStart);
  for (let i = 0; i < ITERATIONS; i++) {
    await educationRepository.findOne({
      where: {
        userId,
      },
    });
  }
  performance.mark(markNameSimpleQueryEnd);
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

    const simpleResult = simpleQuery(userId, connection);
    const joinResult = joinQuery(userId, connection);

    await Promise.all([joinResult, simpleResult]);

    performance.measure(
      "Join query",
      markNameJoinQueryStart,
      markNameJoinQueryEnd,
    );
    performance.measure(
      "Simple query",
      markNameSimpleQueryStart,
      markNameSimpleQueryEnd,
    );
  })
  .catch(error => console.log(error));
