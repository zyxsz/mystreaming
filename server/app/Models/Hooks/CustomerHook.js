const uuid = require("uuid");

const CustomerHook = (exports = module.exports = {});

CustomerHook.uuid = async (customer) => {
  customer.id = uuid.v4();
};
