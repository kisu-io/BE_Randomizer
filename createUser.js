const faker = require("faker");
const User = require("./models/User");
const numberOfUser = 100;
const bcrypt = require("bcrypt");
const SALT_ROUND = parseInt(process.env.SALT_ROUND);

const createUser = async (req, res, next) => {
  console.log("Creating some users");
  const deletePrevLog = await User.collection.drop();

  for (let index = 0; index < numberOfUser; index++) {
    const singleUser = {
      name: faker.name.firstName(),
      email: faker.internet.email(),
      password: "123",
      currentBalance: faker.datatype.number({ min: 100000, max: 1000000 }),
      avatar: faker.image.avatar(),
    };
    // console.log(singleUser.password);
    const found = await User.findOne({ name: singleUser.name });
    const salt = await bcrypt.genSalt(SALT_ROUND);
    singleUser.password = await bcrypt.hash(singleUser.password, salt);
    if (!found) {
      const created = await User.create(singleUser);
      //   console.log(
      //     `Created ${created.name} email ${created.email} password ${created.password} currentBalance ${created.currentBalance} avatar ${created.avatar}`
      //   );
    } else {
      console.log("Found same user name", found.name);
    }
  }
  console.log("Create User Successfully");
  console.log("===========================");
};

module.exports = createUser;
